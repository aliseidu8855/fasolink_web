import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { requestAndSubscribe } from '../../utils/push'

const LS_KEY = 'notif.banner.dismissed'

export default function EnableNotificationsBanner() {
  const { t } = useTranslation(['common'])
  const [show, setShow] = useState(false)
  const vapid = import.meta.env.VITE_VAPID_PUBLIC_KEY

  useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator) || !vapid) return
    const token = localStorage.getItem('authToken')
    if (!token) return
    if (localStorage.getItem(LS_KEY) === '1') return
    if (Notification.permission === 'default') setShow(true)
  }, [vapid])

  if (!show) return null
  const onEnable = async () => {
    const res = await requestAndSubscribe(vapid)
    if (res.ok) setShow(false)
  }
  const onDismiss = () => { setShow(false); try{ localStorage.setItem(LS_KEY,'1') }catch{} }
  return (
    <div role="region" aria-label={t('common:notifications.bannerAria','Notifications prompt')} style={{position:'fixed', bottom:64, left:0, right:0, zIndex:50}}>
      <div style={{margin:'0 auto', maxWidth:960, padding:'12px 16px', background:'var(--color-surface, #fff)', border:'1px solid #ddd', borderRadius:8, boxShadow:'0 2px 8px rgba(0,0,0,0.08)', display:'flex', gap:12, alignItems:'center', justifyContent:'space-between'}}>
        <div>
          <strong>{t('common:notifications.title','Activer les notifications')}</strong>
          <div style={{fontSize:14}}>{t('common:notifications.body','Recevez des alertes lorsqu\'un acheteur ou vendeur vous envoie un message.')}</div>
        </div>
        <div style={{display:'flex', gap:8}}>
          <button onClick={onEnable} className="btn btn-primary">{t('common:notifications.enable','Activer')}</button>
          <button onClick={onDismiss} className="btn btn-ghost">{t('common:dismiss','Ignorer')}</button>
        </div>
      </div>
    </div>
  )
}
