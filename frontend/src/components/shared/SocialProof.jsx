import React, { useContext, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { HiOutlineEye, HiOutlineFire, HiCheckBadge } from 'react-icons/hi2';
import { authDataContext } from '../../context/authContext';

// Persist a pseudo-session id per-browser-tab for viewer tracking
const getSessionId = () => {
    let sid = sessionStorage.getItem('velviera_session_id');
    if (!sid) {
        sid = `s_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
        sessionStorage.setItem('velviera_session_id', sid);
    }
    return sid;
};

/**
 * SocialProof
 * Renders live viewer count + recent purchase count + total sold.
 * Sends a viewer heartbeat every 30s while mounted.
 * Returns social-proof data (including annotated reviews with verifiedBuyer)
 * to the parent via onData so the review list can show verified badges.
 */
const SocialProof = ({ productId, onData }) => {
    const { serverUrl } = useContext(authDataContext);
    const [liveViewers, setLiveViewers] = useState(0);
    const [recentPurchases, setRecentPurchases] = useState(0);
    const [totalSold, setTotalSold] = useState(0);
    const heartbeatRef = useRef(null);

    useEffect(() => {
        if (!productId) return;
        let cancelled = false;
        const sessionId = getSessionId();

        const sendHeartbeat = async () => {
            try {
                const { data } = await axios.post(`${serverUrl}/api/social/viewers/heartbeat`,
                    { productId, sessionId });
                if (!cancelled) setLiveViewers(data.count || 0);
            } catch (e) { /* ignore */ }
        };

        const loadStats = async () => {
            try {
                const { data } = await axios.get(`${serverUrl}/api/social/product/${productId}`);
                if (cancelled) return;
                setLiveViewers(data.liveViewers || 0);
                setRecentPurchases(data.recentPurchases || 0);
                setTotalSold(data.totalSold || 0);
                if (onData) onData(data);
            } catch (e) { /* ignore */ }
        };

        sendHeartbeat().then(loadStats);
        heartbeatRef.current = setInterval(sendHeartbeat, 30000);
        return () => {
            cancelled = true;
            clearInterval(heartbeatRef.current);
        };
    }, [productId]);

    const showAnything = liveViewers > 0 || recentPurchases > 0 || totalSold > 0;
    if (!showAnything) return null;

    return (
        <div className="flex flex-wrap gap-2">
            {liveViewers > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 border border-green-200 text-green-800 text-xs font-medium">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <HiOutlineEye className="w-3.5 h-3.5" />
                    {liveViewers} {liveViewers === 1 ? 'person' : 'people'} viewing now
                </span>
            )}
            {recentPurchases > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-800 text-xs font-medium">
                    <HiOutlineFire className="w-3.5 h-3.5" />
                    {recentPurchases} bought in last 7 days
                </span>
            )}
            {totalSold > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--background-subtle)] border border-[var(--border-base)] text-[var(--text-muted)] text-xs font-medium">
                    🛍️ {totalSold}+ sold
                </span>
            )}
        </div>
    );
};

export { SocialProof };
export { HiCheckBadge as VerifiedBadgeIcon };
export default SocialProof;
