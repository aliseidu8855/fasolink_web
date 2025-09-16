// Deprecated legacy AuthForms component (modal-based) - retained as empty placeholder to avoid build errors during transition.
// All authentication now handled via /auth route (see AuthPage.jsx).
export default function AuthForms(){
  if (import.meta && import.meta.env && import.meta.env.MODE !== 'production') {
    console.warn('AuthForms (legacy) was rendered. It should no longer be in use. Use /auth route instead.');
  }
  return null;
}