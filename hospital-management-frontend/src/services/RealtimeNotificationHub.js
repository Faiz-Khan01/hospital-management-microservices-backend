import AuthService from './AuthService';
import NotificationService from './NotificationService';

const BROADCAST_CHANNEL_NAME = 'hospitalsync_alerts_channel';
const LOCAL_STORAGE_KEY = 'hospitalsync_realtime_notifications';

// Synthesize pleasant, professional medical chime via Web Audio API
export function playHospitalAlertChime() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    // Auto-resume if in suspended state due to browser autoplay policies
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // Tone 1: E5 (659.25 Hz) - Gentle bell attack
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Tone 2: A5 (880 Hz) - Crisp hospital notification tone
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880.0, now + 0.12);
    gain2.gain.setValueAtTime(0.15, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.65);
  } catch (err) {
    console.debug('Hospital chime notification sound note:', err);
  }
}

// Synthesize Airport/Hospital Public Address 3-Tone Chime for Token Calling (C5 -> E5 -> G5)
export function playOpdTokenCallChime() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});

    const now = ctx.currentTime;
    const tones = [
      { freq: 523.25, start: 0, dur: 0.30 },     // C5
      { freq: 659.25, start: 0.22, dur: 0.32 },  // E5
      { freq: 783.99, start: 0.44, dur: 0.65 }   // G5
    ];

    tones.forEach(t => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(t.freq, now + t.start);
      gain.gain.setValueAtTime(0.16, now + t.start);
      gain.gain.exponentialRampToValueAtTime(0.001, now + t.start + t.dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + t.start);
      osc.stop(now + t.start + t.dur);
    });
  } catch (err) {
    console.debug('OPD token chime sound note:', err);
  }
}

// Synthesize urgent Code Red Emergency pager sound
export function playEmergencyCodeRedSiren() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});

    const now = ctx.currentTime;
    [0, 0.22, 0.44].forEach((offset) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, now + offset);
      osc.frequency.exponentialRampToValueAtTime(587.33, now + offset + 0.18);
      gain.gain.setValueAtTime(0.2, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + offset);
      osc.stop(now + offset + 0.18);
    });
  } catch (err) {
    console.debug('Emergency siren sound note:', err);
  }
}

class RealtimeNotificationHub {
  constructor() {
    this.broadcastChannel = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      } catch (e) {
        console.warn('BroadcastChannel not supported in current environment', e);
      }
    }
  }

  getStoredNotifications() {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveStoredNotifications(list) {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list.slice(0, 50)));
    } catch {
      // Ignore storage errors
    }
  }

  /**
   * Publish a hospital notification event across the whole app & open tabs
   */
  publishNotification({
    type,
    title,
    message,
    targetRoles = [], // e.g. ['DOCTOR', 'ADMIN'], ['PHARMACIST', 'ADMIN']
    patientName,
    doctorName,
    meta = {}
  }) {
    const newNotification = {
      id: Date.now(),
      type: type || 'APPOINTMENT_CONFIRMATION',
      title: title || 'Hospital Notification',
      message: message || '',
      targetRoles: Array.isArray(targetRoles) ? targetRoles : [targetRoles],
      patientName,
      doctorName,
      meta,
      createdAt: new Date().toISOString(),
      read: false
    };

    // 1. Save locally
    const current = this.getStoredNotifications();
    this.saveStoredNotifications([newNotification, ...current]);

    // 2. Broadcast to other open browser tabs
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(newNotification);
      } catch (e) {
        console.debug('Broadcast post failed', e);
      }
    }

    // 3. Dispatch in current window
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('hospitalsync:new_notification', {
          detail: newNotification
        })
      );
    }

    // 4. Also call backend notification service asynchronously if available
    try {
      NotificationService.triggerEvent({
        type: newNotification.type,
        patientName,
        doctorName,
        channels: ['IN_APP']
      }).catch(() => {});
    } catch {
      // Ignore backend offline
    }

    return newNotification;
  }

  /**
   * Check if notification is meant for the logged-in user role
   */
  isForCurrentRole(notification) {
    const currentRole = String(AuthService.getRole() || 'ADMIN')
      .replace(/^ROLE_/, '')
      .toUpperCase();

    if (!notification?.targetRoles || notification.targetRoles.length === 0) {
      return true;
    }

    return (
      notification.targetRoles.includes(currentRole) ||
      notification.targetRoles.includes('ALL') ||
      currentRole === 'ADMIN'
    );
  }

  /**
   * Subscribe to live notifications
   */
  subscribe(callback) {
    const handleEvent = (notif) => {
      if (this.isForCurrentRole(notif)) {
        callback(notif);
      }
    };

    const onCustomEvent = (e) => {
      if (e?.detail) handleEvent(e.detail);
    };

    const onBroadcastMessage = (e) => {
      if (e?.data) handleEvent(e.data);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('hospitalsync:new_notification', onCustomEvent);
    }

    if (this.broadcastChannel) {
      this.broadcastChannel.addEventListener('message', onBroadcastMessage);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('hospitalsync:new_notification', onCustomEvent);
      }
      if (this.broadcastChannel) {
        this.broadcastChannel.removeEventListener('message', onBroadcastMessage);
      }
    };
  }

  markAllAsRead() {
    const list = this.getStoredNotifications().map((n) => ({ ...n, read: true }));
    this.saveStoredNotifications(list);
    return list;
  }
}

export default new RealtimeNotificationHub();
