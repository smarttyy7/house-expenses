'use strict';
const $=id=>document.getElementById(id),key='under-one-roof-v1';
const money=n=>new Intl.NumberFormat('en-US',{maximumFractionDigits:2}).format(n);
const escapeText=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
let data={version:1,expenses:[],paid:{}},editing=null,loadError=false;
function validDate(v){return typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&Number(v.slice(0,4))>=2000&&Number(v.slice(0,4))<=9999&&new Date(v+'T12:00:00Z').toISOString().slice(0,10)===v;}
function validate(d){
 if(!d||d.version!==1||!Array.isArray(d.expenses)||d.expenses.length>100000||!d.paid||typeof d.paid!=='object'||Array.isArray(d.paid))throw Error('Invalid backup format.');
 const ids=new Set();
 for(const e of d.expenses){if(!e||typeof e.id!=='string'||!e.id||ids.has(e.id)||!validDate(e.date)||!House.members.includes(e.payer)||!Number.isSafeInteger(e.amount)||e.amount<1||e.amount>1000000000||typeof e.description!=='string'||!e.description.trim()||e.description.length>120)throw Error('Invalid expense in backup.');ids.add(e.id);}
 for(const [m,p] of Object.entries(d.paid)){if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(m)||!Array.isArray(p))throw Error('Invalid settlements.');const allowed=House.calculate(d.expenses.filter(e=>e.date.startsWith(m)),m).transfers.map(transferId);if(p.some(x=>typeof x!=='string'||!allowed.includes(x))||new Set(p).size!==p.length)throw Error('Settlement does not match expenses.');}
 return {version:1,expenses:d.expenses.map(e=>({id:e.id,date:e.date,payer:e.payer,amount:e.amount,description:e.description})),paid:d.paid};
}
try{const raw=localStorage.getItem(key);if(raw)data=validate(JSON.parse(raw));}catch(e){loadError=true;$('notice').textContent='Saved records could not be read. Editing is disabled to protect them. Restore a valid backup to continue.';}
function save(next){try{localStorage.setItem(key,JSON.stringify(next));data=next;return true;}catch(e){alert('Could not save. Your change was not applied. Export a backup and check browser storage.');return false;}}
function transferId(t){return `${t.from}|${t.to}|${t.amount}`;}
function locked(){return (data.paid[$('month').value]||[]).length>0;}
function render(){
 const month=$('month').value,es=data.expenses.filter(e=>e.date.startsWith(month)),s=House.calculate(es,month),paid=data.paid[month]||[];
 document.querySelector('header').dataset.month=month;
 $('total').innerHTML=money(s.total)+' <small>IQD</small>';$('share').innerHTML=money(s.total/6)+' <small>IQD</small>';
 $('count').textContent=`${es.length} expense${es.length===1?'':'s'} this month`;
 $('progress').textContent=s.transfers.length?`${paid.length} of ${s.transfers.length} paid`:'All clear';
 $('progressNote').textContent=s.transfers.length?(paid.length===s.transfers.length?'Everyone is settled for this month':money(s.transfers.filter(t=>!paid.includes(transferId(t))).reduce((a,t)=>a+t.amount,0))+' IQD left to repay'):'No repayments needed';
 if(!loadError)$('notice').textContent=locked()?'Repayments have been recorded. Expenses are locked. To correct an expense, first uncheck this month’s paid repayments; only do so if you intend to recalculate the settlement.':'';
 $('add').disabled=$('first').disabled=locked()||loadError;
 $('expenses').innerHTML=es.slice().sort((a,b)=>b.date.localeCompare(a.date)).map(e=>`<tr><td><strong>${escapeText(e.description)}</strong><div class="muted">${e.date}</div></td><td>${e.payer}</td><td class="right">${money(e.amount)}</td><td><button data-edit="${escapeText(e.id)}" ${locked()||loadError?'disabled':''}>Edit</button><button data-delete="${escapeText(e.id)}" ${locked()||loadError?'disabled':''}>Delete</button></td></tr>`).join('');
 $('empty').hidden=!!es.length;
 $('balances').innerHTML=House.members.map((name,i)=>`<tr><td><strong>${name}</strong></td><td class="right">${money(s.spent[i])}</td><td class="right">${money(s.exact[i])}</td><td class="right">${money(s.balances[i]-s.exact[i])}</td><td class="right ${s.balances[i]>0?'receive':'pay'}"><strong>${s.balances[i]>0?'+':''}${money(s.balances[i])}</strong> ${s.balances[i]>0?'receive':s.balances[i]<0?'pay':'settled'}</td></tr>`).join('');
 $('transfers').innerHTML=s.transfers.map((t,i)=>`<div class="transfer ${paid.includes(transferId(t))?'paid':''}"><div class="transfer-top"><span>${t.from} → ${t.to}</span><strong>${money(t.amount)} <small>IQD</small></strong></div><label><input type="checkbox" data-transfer="${i}" ${paid.includes(transferId(t))?'checked':''} ${loadError?'disabled':''}> Mark paid: ${t.from} to ${t.to}</label></div>`).join('')||'<div class="empty">No payments needed. You’re all square.</div>';
 $('transfers').querySelectorAll('input').forEach(input=>input.onchange=()=>{const id=transferId(s.transfers[Number(input.dataset.transfer)]),next=structuredClone(data);next.paid[month]=input.checked?[...paid,id]:paid.filter(x=>x!==id);save(next);render();});
}
function openExpense(id){if(locked()||loadError)return;editing=id||null;const e=data.expenses.find(x=>x.id===id);$('form').reset();$('dialogTitle').textContent=e?'Edit shared expense':'Add shared expense';$('description').value=e?.description||'';$('amount').value=e?.amount||'';$('payer').value=e?.payer||House.members[0];$('date').value=e?.date||(today().startsWith($('month').value)?today():$('month').value+'-01');$('date').min=$('month').value+'-01';const [y,m]=$('month').value.split('-').map(Number);$('date').max=$('month').value+'-'+new Date(y,m,0).getDate();$('dialog').showModal();}
House.members.forEach(name=>{$('payer').add(new Option(name,name));});
 $('housemates').innerHTML=House.members.map((n,i)=>`<div class="person"><span class="avatar" style="background:${['#edf0df','#f5e9da','#e5edf3','#f3e6df','#e7ede5','#eee6f0'][i]}">${n.slice(0,2).toUpperCase()}</span>${n}</div>`).join('');
 $('month').value=today().slice(0,7);$('month').min='2000-01';let previousMonth=$('month').value;
 $('month').onchange=()=>{if(!$('month').value||!$('month').checkValidity()){$('month').value=previousMonth;return;}previousMonth=$('month').value;render();};
 $('add').onclick=$('first').onclick=()=>openExpense();$('cancel').onclick=()=>$('dialog').close();
 $('expenses').onclick=ev=>{const b=ev.target.closest('button');if(!b||locked()||loadError)return;if(b.dataset.edit)openExpense(b.dataset.edit);if(b.dataset.delete&&confirm('Delete this expense?')){const next=structuredClone(data);next.expenses=next.expenses.filter(e=>e.id!==b.dataset.delete);if(save(next))render();}};
 $('form').onsubmit=ev=>{ev.preventDefault();if(locked()||loadError)return;const e={id:editing||crypto.randomUUID(),description:$('description').value.trim(),amount:Number($('amount').value),payer:$('payer').value,date:$('date').value};if(!e.description||!validDate(e.date)||!e.date.startsWith($('month').value))return;const next=structuredClone(data);if(editing)next.expenses=next.expenses.map(x=>x.id===editing?e:x);else next.expenses.push(e);try{validate(next);}catch(error){alert(error.message);return;}if(save(next)){$('dialog').close();render();}};
 $('backup').onclick=()=>{if(loadError){alert('Saved records could not be read. Restore a known valid backup.');return;}const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=`house-expenses-${today()}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 $('restore').onclick=()=>$('backupFile').click();
 $('backupFile').onchange=async ev=>{const f=ev.target.files[0];if(!f)return;try{if(f.size>20000000)throw Error('Backup is too large.');const next=validate(JSON.parse(await f.text()));if(confirm(`Replace current records with ${next.expenses.length} expenses from this backup? Export your current records first if needed.`)&&save(next)){loadError=false;render();}}catch(error){alert('Could not restore: '+error.message);}ev.target.value='';};
 $('print').onclick=()=>window.print();window.addEventListener('storage',event=>{if(event.key===key){location.reload();}});render();
