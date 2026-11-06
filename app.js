const $=id=>document.getElementById(id);
const options=[{id:'red',name:'레드 크리스마스',file:'frames/red.jpg'},{id:'cream',name:'크림 미니멀',file:'frames/cream.png'},{id:'santa',name:'산타 크리스마스',file:'frames/santa.png'}];
let choice=null,stream=null,photos=[],selected=[],busy=false,overlay=null,previewRunning=false;
const msg=t=>$('message').textContent=t;
const show=n=>{for(let i=1;i<=4;i++)$('step'+i).hidden=i!==n;msg('');window.scrollTo({top:0,behavior:'smooth'});};
options.forEach(o=>{let b=document.createElement('button');b.className='frame-option';b.innerHTML=`<img src="${o.file}" alt="${o.name}"><span>${o.name}</span>`;b.onclick=()=>{choice=o;document.querySelectorAll('.frame-option').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');$('start').disabled=false;};$('frames').append(b)});
async function startCamera(){try{stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:1280},height:{ideal:960}},audio:false});$('video').srcObject=stream;await $('video').play();overlay=await load('frames/'+choice.id+'-overlay.png');show(2);previewRunning=true;requestAnimationFrame(drawPreview)}catch(e){msg('카메라를 사용할 수 없습니다. 브라우저 권한과 HTTPS 또는 localhost 접속 여부를 확인하세요.')}}
function stopCamera(){previewRunning=false;stream?.getTracks().forEach(t=>t.stop());stream=null;$('video').srcObject=null;}
$('start').onclick=startCamera;$('cancel').onclick=()=>{stopCamera();show(1)};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
let audioCtx=null;
function initShutterAudio(){try{audioCtx??=new (window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume().catch(()=>{});}catch(e){}}
function shutterSound(){try{if(!audioCtx)return;const duration=.12,rate=audioCtx.sampleRate,buffer=audioCtx.createBuffer(1,Math.ceil(rate*duration),rate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++){const t=i/rate;data[i]=(Math.random()*2-1)*Math.exp(-t*35)*(Math.sin(t*2*Math.PI*95)>.4?1:.55);}const source=audioCtx.createBufferSource(),gain=audioCtx.createGain();source.buffer=buffer;gain.gain.value=.6;source.connect(gain);gain.connect(audioCtx.destination);source.start();source.stop(audioCtx.currentTime+duration);}catch(e){}}

function snap(){const v=$('video'),c=document.createElement('canvas');c.width=900;c.height=1100;const ctx=c.getContext('2d');const sw=v.videoWidth,sh=v.videoHeight;const scale=Math.max(c.width/sw,c.height/sh),w=sw*scale,h=sh*scale;ctx.translate(c.width,0);ctx.scale(-1,1);ctx.drawImage(v,(c.width-w)/2,(c.height-h)/2,w,h);return c.toDataURL('image/jpeg',.9)}
$('shoot').onclick=async()=>{if(busy)return;busy=true;$('shoot').disabled=true;initShutterAudio();photos=[];try{for(let i=0;i<8;i++){for(let n=10;n>=1;n--){$('countdown').textContent=n;await wait(1000)}$('countdown').textContent='📸';shutterSound();photos.push(snap());$('progress').textContent=`${photos.length} / 8장`;await wait(650)}$('countdown').textContent='';stopCamera();renderShots();show(3)}catch(e){msg('촬영에 실패했습니다. 다시 시도해주세요.')}finally{busy=false;$('shoot').disabled=false}};
function renderShots(){selected=[];$('shots').innerHTML='';photos.forEach((src,i)=>{let b=document.createElement('button');b.className='shot';b.innerHTML=`<img src="${src}" alt="촬영 사진 ${i+1}"><b>${i+1}</b>`;b.onclick=()=>{if(selected.includes(i))selected=selected.filter(x=>x!==i);else if(selected.length<4)selected.push(i);document.querySelectorAll('.shot').forEach((el,j)=>el.classList.toggle('selected',selected.includes(j)));$('selectedCount').textContent=`${selected.length} / 4장 선택 (선택한 순서대로 배치)`;$('make').disabled=selected.length!==4;};$('shots').append(b)});$('selectedCount').textContent='0 / 4장 선택';$('make').disabled=true;}
$('retake').onclick=async()=>{photos=[];$('progress').textContent='0 / 8장';await startCamera()};
const load=src=>new Promise((resolve,reject)=>{let i=new Image();i.onload=()=>resolve(i);i.onerror=reject;i.src=src});
function crop(ctx,img,x,y,w,h){const s=Math.max(w/img.width,h/img.height),sw=w/s,sh=h/s;ctx.drawImage(img,(img.width-sw)/2,(img.height-sh)/2,sw,sh,x,y,w,h)}
function ellipse(ctx,img,x,y,w,h){ctx.save();ctx.beginPath();ctx.ellipse(x+w/2,y+h/2,w/2,h/2,0,0,Math.PI*2);ctx.clip();crop(ctx,img,x,y,w,h);ctx.restore()}
const layouts={
 red:[['rect',62,123,447,597],['rect',534,123,447,597],['rect',62,749,447,597],['rect',534,749,447,597]],
 cream:[['rect',62,66,447,597],['rect',534,180,447,597],['rect',62,688,447,597],['rect',534,801,447,597]],
 santa:[['rect',72,255,430,480],['ellipse',552,899,428,440],['ellipse',670,272,96,94],['ellipse',185,912,120,103]]
};
function drawSlots(ctx,images){const s=1240/1044;layouts[choice.id].forEach(([shape,x,y,w,h],i)=>{let img=images[i];if(!img)return;const box=[x*s,y*s,w*s,h*s];if(shape==='ellipse')ellipse(ctx,img,...box);else crop(ctx,img,...box)})}
function drawPreview(){if(!previewRunning)return;const c=$('livePreview'),ctx=c.getContext('2d'),v=$('video');ctx.clearRect(0,0,c.width,c.height);if(v.readyState>=2){ // 거울처럼 좌우 반전된 영상을 프레임 안에 표시
 const temp=document.createElement('canvas');temp.width=v.videoWidth;temp.height=v.videoHeight;const t=temp.getContext('2d');t.translate(temp.width,0);t.scale(-1,1);t.drawImage(v,0,0);drawSlots(ctx,[temp,temp,temp,temp]);}
 if(overlay)ctx.drawImage(overlay,0,0,1240,1748);requestAnimationFrame(drawPreview)}
async function compose(){const ctx=$('result').getContext('2d'),imgs=await Promise.all(selected.map(i=>load(photos[i]))),mask=await load('frames/'+choice.id+'-overlay.png');ctx.clearRect(0,0,1240,1748);drawSlots(ctx,imgs);ctx.drawImage(mask,0,0,1240,1748);show(4)}
$('make').onclick=()=>compose().catch(()=>msg('사진 합성 중 오류가 발생했습니다.'));
const filename='christmas-photobooth.png';
$('download').onclick=()=>{$('result').toBlob(blob=>{if(!blob)return;let u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)},'image/png')};
$('share').onclick=()=>{$('result').toBlob(async blob=>{if(!blob)return;const file=new File([blob],filename,{type:'image/png'});try{if(navigator.canShare?.({files:[file]})){await navigator.share({files:[file],title:'크리스마스 인생네컷'});return}}catch(e){if(e.name==='AbortError')return}msg('이 브라우저는 사진 파일 직접 공유를 지원하지 않습니다. PNG 저장 후 이메일에 첨부해주세요.');$('download').click();window.location.href='mailto:?subject='+encodeURIComponent('크리스마스 인생네컷')+'&body='+encodeURIComponent('완성된 인생네컷 사진을 첨부합니다.');},'image/png')};
$('again').onclick=()=>{stopCamera();photos=[];selected=[];show(1)};
