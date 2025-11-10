const $ = (sel, ctx=document) => ctx.querySelector(sel);
const $$ = (sel, ctx=document) => [...ctx.querySelectorAll(sel)];
document.addEventListener('DOMContentLoaded', ()=>{
  $('#year').textContent = new Date().getFullYear();
  const nav = $('.site-nav'); const btn = $('.nav-toggle');
  btn.addEventListener('click', ()=>{ const exp = btn.getAttribute('aria-expanded')==='true'; btn.setAttribute('aria-expanded', String(!exp)); nav.setAttribute('aria-expanded', String(!exp)); });
  const menuLinks = $$('#menu a'); const sections = $$('main section[id]'); const map = new Map(sections.map(s=>[s.id,s]));
  function show(id){ map.forEach((sec,k)=>{ k===id? sec.removeAttribute('hidden') : sec.setAttribute('hidden',''); }); menuLinks.forEach(a=>a.classList.toggle('active', a.getAttribute('href')===`#${id}`)); window.location.hash=id; }
  show((location.hash||'#inicio').replace('#',''));
  menuLinks.forEach(a=> a.addEventListener('click', e=>{ e.preventDefault(); show(a.getAttribute('href').replace('#','')); }));
  ['wheel','touchmove'].forEach(evt=> window.addEventListener(evt, e=> e.preventDefault(), {passive:false}));
  window.addEventListener('keydown', e=>{ const keys=['ArrowDown','ArrowUp','PageDown','PageUp','Space','Home','End']; if(keys.includes(e.code)) e.preventDefault(); });
  const form=$('#contactForm'), status=$('#formStatus');
  if(form){
    const submitBtn = form.querySelector('button[type="submit"]');
    const nameInput = form.querySelector('#name');
    const emailInput = form.querySelector('#email');
    const messageInput = form.querySelector('#message');
    const nameError = document.getElementById('nameError');
    const emailError = document.getElementById('emailError');
    const messageError = document.getElementById('messageError');
    const btnSpinner = document.getElementById('btnSpinner');
    const btnText = document.getElementById('btnText');

    function clearFieldErrors(){
      [nameInput,emailInput,messageInput].forEach(i=>{ if(i) i.classList.remove('invalid'); });
      [nameError,emailError,messageError].forEach(e=>{ if(e) e.style.display='none'; });
    }

    function showStatus(message, type){
      if(!status) return;
      status.style.display='inline-block';
      status.classList.remove('status--success','status--error');
      if(type==='success') status.classList.add('status--success');
      else if(type==='error') status.classList.add('status--error');
      status.textContent = message;
    }

    function validate(){
      clearFieldErrors();
      let ok = true;
      if(!nameInput || nameInput.value.trim().length===0){ if(nameInput) nameInput.classList.add('invalid'); if(nameError) nameError.style.display='block'; ok=false; }
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if(!emailInput || !emailRe.test(emailInput.value.trim())){ if(emailInput) emailInput.classList.add('invalid'); if(emailError) emailError.style.display='block'; ok=false; }
      if(!messageInput || messageInput.value.trim().length<10){ if(messageInput) messageInput.classList.add('invalid'); if(messageError) messageError.style.display='block'; ok=false; }
      return ok;
    }

    form.addEventListener('submit', async (e)=>{
      e.preventDefault();
      clearFieldErrors();
      if(!validate()){
        showStatus('Por favor corrige los errores del formulario.', 'error');
        // focus first invalid
        const firstInvalid = form.querySelector('.invalid'); if(firstInvalid) firstInvalid.focus();
        return;
      }
      if(status) { showStatus('Enviando...', null); }
      if(submitBtn) { submitBtn.disabled = true; }
      if(btnSpinner) btnSpinner.style.display='inline-block';
      if(btnText) btnText.textContent = 'Enviando...';
      try{
        const EP = form.dataset.endpoint || form.action || 'https://formspree.io/f/mzzypvdj';
        const r = await fetch(EP, { method: 'POST', headers: { 'Accept': 'application/json' }, body: new FormData(form) });
        if(r.ok){
          showStatus('¡Mensaje enviado! Gracias por contactarme.', 'success');
          form.reset();
        } else {
          let msg = 'No se pudo enviar.';
          try{ const data = await r.json(); if(data && data.error) msg = data.error; }catch(_){ }
          showStatus(msg, 'error');
        }
      }catch(err){
        showStatus('Error de red. Revisa tu conexión.', 'error');
      } finally {
        if(submitBtn) { submitBtn.disabled = false; }
        if(btnSpinner) btnSpinner.style.display='none';
        if(btnText) btnText.textContent = 'Enviar mensaje';
      }
    });
  }
});