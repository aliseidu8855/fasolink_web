// Placeholder lazy-loaded Facebook auth stub
export async function startFacebook(){
  await new Promise(r=>setTimeout(r,600));
  console.info('[facebookStub] Facebook auth flow would start here.');
  return { ok:true };
}
