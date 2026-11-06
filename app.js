const $=id=>document.getElementById(id);
const options=[{id:'red',name:'레드 크리스마스',file:'frames/red.jpg'},{id:'cream',name:'크림 미니멀',file:'frames/cream.png'},{id:'santa',name:'산타 크리스마스',file:'frames/santa.png'}];
let choice=null,stream=null,photos=[],selected=[],busy=false;
const msg=t=>$('message').textContent=t;
const show=n=>{for(let i=1;i<=4;i++)$('step'+i).hidden=i!==n;msg('');window.scrollTo({top:0,behavior:'smooth'});};
options.forEach(o=>{let b=document.createElement('button');b.className='frame-option';b.innerHTML=`<img src="${o.file}" alt="${o.name}"><span>${o.name}</span>`;b.onclick=()=>{choice=o;document.querySelectorAll('.frame-option').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');$('start').disabled=false;};$('frames').append(b)});
async function startCamera(){try{stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:1280},height:{ideal:960}},audio:false});$('video').srcObject=stream;await $('video').play();show(2)}catch(e){msg('카메라를 사용할 수 없습니다. 브라우저 권한과 HTTPS 또는 localhost 접속 여부를 확인하세요.')}}
function stopCamera(){stream?.getTracks().forEach(t=>t.stop());stream=null;$('video').srcObject=null;}
$('start').onclick=startCamera;$('cancel').onclick=()=>{stopCamera();show(1)};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
function snap(){const v=$('video'),c=document.createElement('canvas');c.width=900;c.height=1100;const ctx=c.getContext('2d');const sw=v.videoWidth,sh=v.videoHeight;const scale=Math.max(c.width/sw,c.height/sh),w=sw*scale,h=sh*scale;ctx.translate(c.width,0);ctx.scale(-1,1);ctx.drawImage(v,(c.width-w)/2,(c.height-h)/2,w,h);return c.toDataURL('image/jpeg',.9)}
$('shoot').onclick=async()=>{if(busy)return;busy=true;$('shoot').disabled=true;photos=[];try{for(let i=0;i<8;i++){for(let n=3;n>=1;n--){$('countdown').textContent=n;await wait(850)}$('countdown').textContent='📸';photos.push(snap());$('progress').textContent=`${photos.length} / 8장`;await wait(650)}$('countdown').textContent='';stopCamera();renderShots();show(3)}catch(e){msg('촬영에 실패했습니다. 다시 시도해주세요.')}finally{busy=false;$('shoot').disabled=false}};
function renderShots(){selected=[];$('shots').innerHTML='';photos.forEach((src,i)=>{let b=document.createElement('button');b.className='shot';b.innerHTML=`<img src="${src}" alt="촬영 사진 ${i+1}"><b>${i+1}</b>`;b.onclick=()=>{if(selected.includes(i))selected=selected.filter(x=>x!==i);else if(selected.length<4)selected.push(i);document.querySelectorAll('.shot').forEach((el,j)=>el.classList.toggle('selected',selected.includes(j)));$('selectedCount').textContent=`${selected.length} / 4장 선택 (선택한 순서대로 배치)`;$('make').disabled=selected.length!==4;};$('shots').append(b)});$('selectedCount').textContent='0 / 4장 선택';$('make').disabled=true;}
$('retake').onclick=async()=>{photos=[];$('progress').textContent='0 / 8장';await startCamera()};
const load=src=>new Promise((resolve,reject)=>{let i=new Image();i.onload=()=>resolve(i);i.onerror=reject;i.src=src});
function crop(ctx,img,x,y,w,h){const s=Math.max(w/img.width,h/img.height),sw=w/s,sh=h/s;ctx.drawImage(img,(img.width-sw)/2,(img.height-sh)/2,sw,sh,x,y,w,h)}
function ellipse(ctx,img,x,y,w,h){ctx.save();ctx.beginPath();ctx.ellipse(x+w/2,y+h/2,w/2,h/2,0,0,Math.PI*2);ctx.clip();crop(ctx,img,x,y,w,h);ctx.restore()}
async function compose(){const ctx=$('result').getContext('2d'),template=await load(choice.file),imgs=await Promise.all(selected.map(i=>load(photos[i])));ctx.clearRect(0,0,1240,1748);ctx.drawImage(template,0,0,1240,1748);const s=1240/1044;
if(choice.id==='red'){const rects=[[62,123,447,597],[534,123,447,597],[62,749,447,597],[534,749,447,597]];rects.forEach(([x,y,w,h],i)=>crop(ctx,imgs[i],x*s,y*s,w*s,h*s));}
else if(choice.id==='cream'){const rects=[[62,66,447,597],[534,180,447,597],[62,688,447,597],[534,801,447,597]];rects.forEach(([x,y,w,h],i)=>crop(ctx,imgs[i],x*s,y*s,w*s,h*s));}
else{ // 산타 프레임: 좌상단 사각형, 우하단 원형, 산타 얼굴 2곳
const a=[72,255,430,480];crop(ctx,imgs[0],...a.map(v=>v*s));
const b=[552,899,428,440];ellipse(ctx,imgs[1],...b.map(v=>v*s));
ellipse(ctx,imgs[2],670*s,272*s,96*s,94*s);
ellipse(ctx,imgs[3],185*s,912*s,120*s,103*s);
}
show(4)}
$('make').onclick=()=>compose().catch(()=>msg('사진 합성 중 오류가 발생했습니다.'));
const filename='christmas-photobooth.png';
$('download').onclick=()=>{$('result').toBlob(blob=>{if(!blob)return;let u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)},'image/png')};
$('share').onclick=()=>{$('result').toBlob(async blob=>{if(!blob)return;const file=new File([blob],filename,{type:'image/png'});try{if(navigator.canShare?.({files:[file]})){await navigator.share({files:[file],title:'크리스마스 인생네컷'});return}}catch(e){if(e.name==='AbortError')return}msg('이 브라우저는 사진 파일 직접 공유를 지원하지 않습니다. PNG 저장 후 이메일에 첨부해주세요.');$('download').click();window.location.href='mailto:?subject='+encodeURIComponent('크리스마스 인생네컷')+'&body='+encodeURIComponent('완성된 인생네컷 사진을 첨부합니다.');},'image/png')};
$('again').onclick=()=>{stopCamera();photos=[];selected=[];show(1)};
