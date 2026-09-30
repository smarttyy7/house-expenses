(function(root){
  const members=['Satpal','Sekhar','Naseebuddin','Shafiq','Rakesh','Sukumar'];
  function calculate(expenses,month){
    const spent=members.map(name=>expenses.filter(e=>e.payer===name).reduce((s,e)=>s+e.amount,0));
    const total=spent.reduce((a,b)=>a+b,0);
    const exact=spent.map(v=>v-total/6);
    // Largest-remainder allocation minimizes rounding error subject to zero sum.
    const numerators=spent.map(v=>v*6-total);
    const units=numerators.map(v=>Math.floor(v/1500));
    const rotation=(Number(month.slice(0,4))*12+Number(month.slice(5,7)))%6;
    const order=members.map((_,i)=>i).sort((a,b)=>(numerators[b]-units[b]*1500)-(numerators[a]-units[a]*1500)||((a-rotation+6)%6)-((b-rotation+6)%6));
    const missing=-units.reduce((a,b)=>a+b,0);
    for(let j=0;j<missing;j++)units[order[j]]++;
    const balances=units.map(v=>v*250);
    const debt=balances.map((v,i)=>({i,v:-v})).filter(x=>x.v>0);
    const credit=balances.map((v,i)=>({i,v})).filter(x=>x.v>0);
    const transfers=[];let d=0,c=0;
    while(d<debt.length&&c<credit.length){
      const amount=Math.min(debt[d].v,credit[c].v);
      transfers.push({from:members[debt[d].i],to:members[credit[c].i],amount});
      debt[d].v-=amount;credit[c].v-=amount;
      if(!debt[d].v)d++;if(!credit[c].v)c++;
    }
    return {spent,total,exact,balances,transfers};
  }
  const api={members,calculate};if(typeof module!=='undefined')module.exports=api;else root.House=api;
})(globalThis);
