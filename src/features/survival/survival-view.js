export function createSurvivalView({ healthBar, hungerBar }) {
  return function renderStats({ health, hunger }) {
      healthBar.innerHTML=Array.from({length:10},(_,i)=>`<span class="${health<=i*2?'empty':''}">${health>=i*2+2?'❤️':health===i*2+1?'💔':'🖤'}</span>`).join('');
      hungerBar.innerHTML=Array.from({length:10},(_,i)=>`<span class="${hunger<=i*2?'empty':''}">${hunger>=i*2+2?'🍖':hunger===i*2+1?'🥩':'🖤'}</span>`).join('');
      healthBar.title=`Vida: ${health}/20`;hungerBar.title=`Hambre: ${hunger}/20`;
  };
}
