// Placeholder lazy-loaded Google auth stub
export async function startGoogle(){
  // simulate network delay
  await new Promise(r=>setTimeout(r,600));
  console.info('[googleStub] Google auth flow would start here.');
  return { ok:true };
}
