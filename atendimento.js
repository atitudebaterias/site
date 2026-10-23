const $ = (selector, root=document) => root.querySelector(selector);
const esc = value => String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const families={sli:{nome:'Convencionais · SLI',descricao:'Partida e sistemas elétricos do veículo. Confira a aplicação antes de escolher.'},efb:{nome:'EFB · Start-Stop',descricao:'Tecnologia reforçada para aplicações específicas. Verifique a recomendação do fabricante.'},agm:{nome:'AGM',descricao:'Aplicações de maior exigência elétrica. Confira a especificação do fabricante antes da troca.'},estacionaria:{nome:'Estacionárias',descricao:'Energia para nobreaks, segurança e outras aplicações estacionárias. Consulte a aplicação com nossa equipe.'},moto:{nome:'Motos · Haizer',descricao:'Baterias para motocicletas e outras aplicações específicas. Consulte a aplicação com nossa equipe.'}};
families.eletrica={nome:'Mobilidade elétrica',descricao:'Aplicação a confirmar.'};families.tracionaria={nome:'Tracionária',descricao:'Uso industrial; aplicação a confirmar.'};
const typeNames={leve:'Carros e utilitários',moto:'Motos e mobilidade',pesada:'Linha pesada',estacionaria:'Uso estacionário',industrial:'Industrial'};
const normalize = value => String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const wa = text => 'https://wa.me/'+LOJA.whatsapp+'?text='+encodeURIComponent(text);
let state={}, trigger=null;
const dialog=$('#flow');
function option(value,label,current){return `<option value="${esc(value)}" ${value===current?'selected':''}>${esc(label)}</option>`}
function select(label,name,values,current,required=true){return `<label>${label}<select name="${name}" ${required?'required':''}>${values.map(([v,l])=>option(v,l,current)).join('')}</select></label>`}
function input(label,name,value='',extra='',required=true){return `<label>${label}<input name="${name}" value="${esc(value)}" ${required?'required':''} ${extra}></label>`}
function years(){return [['','Selecione'],...Array.from({length:new Date().getFullYear()-1950+2},(_,i)=>{const y=String(new Date().getFullYear()+1-i);return [y,y]}),['Não sei informar','Não sei informar']]}
function vehicleBrands(){const names=state.category==='moto'?['Honda','Yamaha','Suzuki','Kawasaki','BMW','Triumph','Royal Enfield','Dafra','Shineray','Haojue','Bajaj']:['Chevrolet','Fiat','Volkswagen','Ford','Renault','Hyundai','Toyota','Honda','Nissan','Jeep','Peugeot','Citroën','Mitsubishi','Kia','Chery','BYD','GWM','Suzuki','BMW','Mercedes-Benz','Audi','Volvo'];return [['','Selecione'],...names.map(n=>[n,n]),['Outra','Outra marca']]}
function remember(){const form=$('#request-form');if(form)for(const [key,value] of new FormData(form))state[key]=value.trim()}
function openDialog(mode,element,product){trigger=element;state={mode,stage:mode==='urgent'?'address':'confirm',product,category:product?.categoria||'leve',brand:'',brandOther:'',model:$('#vehicle-model')?.value.trim()||'',year:'',engine:'',exchange:'',city:'',address:'',reference:''};if(!dialog.open)dialog.showModal();document.body.classList.add('modal-open');renderDialog()}
function closeDialog(){dialog.close();document.body.classList.remove('modal-open');trigger?.focus()}
function showWelcome(){state={mode:'welcome'};dialog.showModal();document.body.classList.add('modal-open');renderDialog()}
function productName(p){return `${p.marca} ${p.codigo}`}
function vehicleText(){return [state.brand==='Outra'?state.brandOther:state.brand,state.model,state.year?`ano ${state.year}`:'',state.engine?`motor ${state.engine}`:''].filter(Boolean).join(' · ')}
function shortMessage(direct=false){
  if(state.mode==='urgent')return `Olá, preciso de uma bateria com muita urgência.\nEstou parado em: ${state.address}, ${state.city}.${state.reference?'\nReferência: '+state.reference:''}\nMeu veículo: ${vehicleText()}.\n${state.exchange==='sim'?'Com troca da bateria usada.':'Não tenho bateria usada; preciso de orientação sobre a devolução.'}`;
  const first=`Olá! Tenho interesse na bateria ${productName(state.product)}.`;
  if(direct)return `${first}\nJá identifiquei esse modelo. Gostaria de confirmar preço e disponibilidade.`;
  return `${first}\nPreciso confirmar se serve no meu veículo: ${vehicleText()}.\n${state.exchange==='sim'?'Com troca da bateria usada.':'Não tenho bateria usada; preciso de orientação sobre a devolução.'}`;
}
function renderDialog(){
  const welcome=state.mode==='welcome', urgent=state.mode==='urgent', vehicle=state.stage==='vehicle';
  $('#flow-mode').textContent=welcome?'ATITUDE BATERIAS':urgent?'ATENDIMENTO URGENTE':'CONSULTA DE PRODUTO';
  $('.progress',dialog).hidden=welcome||!urgent;
  $('#progress-bar').style.width=vehicle?'100%':'50%';
  let title,description,body,actions;
  if(welcome){
    title='Seu carro parou?';description='Está com urgência para comprar uma bateria? Envie o endereço e os dados do veículo para um vendedor.';
    body='<div class="welcome-actions"><button type="button" class="primary-btn whatsapp-cta" data-urgent>Sim, preciso com urgência ↗</button><button type="button" class="secondary-btn" id="browse-home">Sem urgência, conhecer o site</button></div>';
  }else if(urgent&&!vehicle){
    title='Onde você está?';description='Conte onde o veículo está parado.';
    body=`<p class="step-count">1 DE 2 · ENDEREÇO</p><div class="form-grid">${select('Cidade','city',[['','Selecione'],['São José dos Pinhais','São José dos Pinhais'],['Curitiba','Curitiba'],['Outra cidade','Outra cidade']],state.city)}${input('Endereço, número e bairro','address',state.address,'autocomplete="street-address" maxlength="220" placeholder="Rua, número e bairro"')}${input('Ponto de referência / outra cidade (opcional)','reference',state.reference,'maxlength="150"',false)}</div>`;
    actions='<button type="submit" class="primary-btn">Continuar →</button>';
  }else if(!vehicle){
    title='Esta é a sua bateria?';description=productName(state.product);
    body=`<p class="intro">Se já identificou o modelo, consulte o vendedor. Se estiver em dúvida, acrescente os dados do veículo.</p><div class="confirm-actions"><a class="primary-btn whatsapp-cta" href="${esc(wa(shortMessage(true)))}" target="_blank" rel="noopener noreferrer">Sim, consultar no WhatsApp ↗</a><button type="button" class="secondary-btn" id="need-help">Não tenho certeza, informar veículo</button></div><p class="micro-note">Preço e disponibilidade sob consulta. A compra é concluída com o vendedor.</p>`;
  }else{
    title='Qual é o seu veículo?';description=urgent?'Só mais estas informações e você já pode chamar o vendedor.':`Vamos conferir a aplicação da ${productName(state.product)}.`;
    body=`${urgent?'<p class="step-count">2 DE 2 · VEÍCULO E TROCA</p>':''}<div class="form-grid">${select('Marca do veículo','brand',vehicleBrands(),state.brand,false)}<label id="other-brand" ${state.brand==='Outra'?'':'hidden'}>Qual marca?<input name="brandOther" value="${esc(state.brandOther)}" maxlength="60" ${state.brand==='Outra'?'required':''}></label>${input('Modelo do veículo','model',state.model,'maxlength="100" placeholder="Ex.: Onix ou CG 160"')}${select('Ano','year',years(),state.year)}${input('Motor / versão (se souber)','engine',state.engine,'maxlength="80" placeholder="Ex.: 1.0"',false)}${select('Bateria usada para devolução','exchange',[['','Selecione'],['sim','Tenho a bateria usada para troca'],['nao','Não tenho; preciso de orientação']],state.exchange)}</div><p class="application-note">Na Atitude, a reposição de baterias de chumbo-ácido é feita à base de troca, com entrega da bateria usada para destinação ambientalmente adequada. A devolução integra a logística reversa prevista na legislação. Se você não tem uma bateria usada, fale com nossa equipe para orientar seu caso.</p>`;
    actions=`<button type="button" class="secondary-btn" id="back-request">Voltar</button><button type="submit" class="primary-btn whatsapp-cta">Enviar para o WhatsApp ↗</button>`;
  }
  $('#flow-content').innerHTML=`<h2 id="flow-title" tabindex="-1">${title}</h2><p class="intro">${esc(description)}</p><form id="request-form">${body}${actions?`<div class="form-actions">${actions}</div>`:''}</form>`;
  $('#request-form').onsubmit=e=>{e.preventDefault();remember();if(urgent&&!vehicle){state.stage='vehicle';renderDialog()}else if(vehicle){window.open(wa(shortMessage()),'_blank','noopener,noreferrer')}};
  $('#browse-home')?.addEventListener('click',()=>{closeDialog();window.scrollTo({top:0,behavior:'smooth'})});
  $('#need-help')?.addEventListener('click',()=>{state.stage='vehicle';renderDialog()});
  $('#back-request')?.addEventListener('click',()=>{remember();state.stage=urgent?'address':'confirm';renderDialog()});
  $('[name="brand"]')?.addEventListener('change',e=>{const other=e.target.value==='Outra';$('#other-brand').hidden=!other;$('[name="brandOther"]').required=other});
  dialog.scrollTop=0;$('#flow-title').focus({preventScroll:true});
}
function currentFilters(){return {scope:document.body.dataset.category||'all',subtype:$('#filter-subtype')?.value||'all',type:$('#filter-type')?.value||'all',family:$('#filter-family')?.value||'all',brand:$('#filter-brand')?.value||'all',ah:$('#filter-ah')?.value||'all',search:normalize($('#product-search')?.value)}}
function inCategory(p,scope){return !scope||scope==='all'||(scope==='start-stop'?['efb','agm'].includes(p.familia):p.categoria===scope)}
function categoryMessage(){const f=currentFilters();return 'Olá, Atitude Baterias! Gostaria de consultar uma bateria para '+(document.body.dataset.categoryName||'meu veículo')+(f.subtype!=='all'?' · '+f.subtype:'')+($('#vehicle-model')?.value.trim()?' · modelo '+$('#vehicle-model').value.trim():'')+'.';}
function selectProducts(f){return LOJA.produtos.filter(p=>(f.type==='all'||p.categoria===f.type)&&(f.family==='all'||p.familia===f.family)&&(f.brand==='all'||p.marca===f.brand)&&(f.ah==='all'||(f.ah==='unknown'?p.ah==null:String(p.ah)===f.ah))&&(!f.search||normalize([p.codigo,p.marca,p.linha].join(' ')).includes(f.search)))}
function renderCatalog(){
  if(!$('#products'))return;
  const full=document.body.dataset.page==='products',f=currentFilters();
  let products=full?selectProducts(f).filter(p=>inCategory(p,f.scope)&&(f.subtype==='all'||p.aplicacoes?.includes(f.subtype))):['EXF60DPD','ADF60HD','HZR6.5S'].map(id=>LOJA.produtos.find(p=>p.id===id)).filter(Boolean);
  $('#catalog-count').textContent=`${products.length} ${products.length===1?'modelo':'modelos'} ${full?'no catálogo':'em destaque'}`;
  if($('#family-description'))$('#family-description').textContent=f.family==='all'?'A seleção inicial é focada em veículos leves. Conheça as famílias e confira os modelos abaixo.':families[f.family].descricao;
  document.querySelectorAll('[data-family]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.family===f.family)));
  if(!products.length){$('#products').innerHTML=`<div class="empty-catalog"><p class="eyebrow">ATENDIMENTO COM UM ESPECIALISTA</p><h3>${LOJA.produtos.some(p=>inCategory(p,f.scope))?'Nenhum modelo com esses filtros.':'Vamos encontrar a bateria para sua aplicação.'}</h3><p>${LOJA.produtos.some(p=>inCategory(p,f.scope))?'Ajuste os filtros ou peça ajuda para escolher.':'Os modelos desta linha ainda estão em preparação. Informe a aplicação e consulte opções e disponibilidade com nossa equipe.'}</p><button class="secondary-btn" data-clear-filters>Limpar filtros</button> <a class="primary-btn whatsapp-cta category-consult" href="${esc(wa(categoryMessage()))}" target="_blank" rel="noopener noreferrer">Consultar no WhatsApp ↗</a></div>`;return;}
  $('#products').innerHTML=products.map(p=>`<article class="product"><button class="product-open" data-product="${esc(p.id)}" aria-label="Consultar bateria ${esc(productName(p))}"><div class="product-photo"><span class="product-tag">${esc(families[p.familia].nome)}</span><img src="${esc(p.imagem)}" alt="Bateria ${esc(p.marca)} — ${esc(p.imagemLegenda)}" width="400" height="260" loading="lazy" decoding="async"><small>${esc(p.imagemLegenda)}</small></div><div class="product-body"><p class="product-brand">${esc(p.marca)}</p><h3>${esc(p.codigo)}</h3><p class="specs">${esc(p.linha)}<br>${esc(typeNames[p.categoria]||p.categoria)} · aplicação a conferir${p.garantiaMeses?`<br>Garantia: ${p.garantiaMeses} meses`:""}</p><p class="price consult-price">Consulte disponibilidade</p><span class="product-action">Escolher esta bateria ↗</span></div></button></article>`).join('');
}
function clearFilters(){for(const id of ['filter-type','filter-family','filter-brand','filter-ah','filter-subtype'])if($('#'+id))$('#'+id).value='all';$('#product-search').value='';$('#vehicle-model').value='';renderCatalog()}
document.addEventListener('click',e=>{
  const urgent=e.target.closest('[data-urgent],[data-start="urgent"]');if(urgent){e.preventDefault();openDialog('urgent',urgent)}
  const planned=e.target.closest('[data-start="planned"]');if(planned)location.href='produtos.html';
  const p=e.target.closest('[data-product]');if(p)openDialog('product',p,LOJA.produtos.find(x=>x.id===p.dataset.product));
  const family=e.target.closest('[data-family]');if(family){$('#filter-family').value=family.dataset.family;renderCatalog()}
  if(e.target.closest('[data-clear-filters]'))clearFilters();
});
$('#close-flow')?.addEventListener('click',closeDialog);
dialog?.addEventListener('cancel',e=>{e.preventDefault();closeDialog()});
dialog?.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDialog()}});
if(document.body.dataset.page==='products'){
  const categoryProducts=LOJA.produtos.filter(p=>inCategory(p,document.body.dataset.category));
  if(!categoryProducts.length){for(const id of ['filter-brand','filter-ah','product-search'])$('#'+id).closest('label').hidden=true;$('#application-note').textContent='Selecione a aplicação e, se souber, informe o modelo. Esses dados acompanham sua consulta ao vendedor.';$('.catalog-disclaimer').textContent='Consulte opções, aplicação e disponibilidade com nossa equipe.';}
  $('#filter-brand').innerHTML+=[...new Set(categoryProducts.map(p=>p.marca))].sort().map(b=>option(b,b,'')).join('');
  const capacities=[...new Set(categoryProducts.map(p=>p.ah).filter(x=>x!=null))].sort((a,b)=>a-b);
  $('#filter-ah').innerHTML+=capacities.map(a=>option(String(a),a+' Ah','')).join('')+ (LOJA.produtos.some(p=>p.ah==null)?option('unknown','A confirmar na ficha técnica',''):'');
  const params=new URLSearchParams(location.search);if(families[params.get('familia')]&&$('#filter-family'))$('#filter-family').value=params.get('familia');
  for(const id of ['filter-type','filter-family','filter-brand','filter-ah','filter-subtype'])$('#'+id)?.addEventListener('change',renderCatalog);
  $('#vehicle-model')?.addEventListener('input',renderCatalog);
  $('#product-search').addEventListener('input',renderCatalog);$('#clear-filters').addEventListener('click',clearFilters);
}
document.querySelectorAll('.whatsapp-link').forEach(a=>a.href=wa('Olá, Atitude Baterias! Gostaria de atendimento para escolher uma bateria.'));
document.querySelectorAll('.whatsapp-link').forEach(a=>a.addEventListener('click',()=>{if(document.body.dataset.category)a.href=wa(categoryMessage())}));
renderCatalog();
if(document.body.dataset.page==='home'){
  let seen=false;try{seen=sessionStorage.getItem('atitude-welcome')==='1';sessionStorage.setItem('atitude-welcome','1')}catch{}
  if(!seen)showWelcome();
}
