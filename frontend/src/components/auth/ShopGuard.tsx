import React, { useEffect, useState } from 'react';
import { useParams, Navigate, useLocation } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuth } from '../../context/AuthContext';
import { getMyShop } from '../../api/shops';

interface ShopGuardProps {
    children: JSX.Element;
}

const ShopGuard: React.FC<ShopGuardProps> = ({ children }) => {
    const { shopId } = useParams<{ shopId: string }>();
    const { user, isLoading } = useAuth();
    const [myShopId, setMyShopId] = useState<number | null>(null);
    const [isChecking, setIsChecking] = useState(true);
    const [error, setError] = useState<boolean>(false);
    const location = useLocation();

    useEffect(() => {
        const checkAccess = async () => {
            if (isLoading) return;

            if (!user) {
                // Not logged in, stop checking and let render handle redirect
                setIsChecking(false);
                return;
            }

            try {
                const shop = await getMyShop();
                setMyShopId(shop.shop_id);

                // If current URL shopId doesn't match my shopId, we log it
                if (shopId && String(shopId) !== String(shop.shop_id)) {
                    console.log(`[ShopGuard] Redirecting from shop ${shopId} to ${shop.shop_id}`);
                }
            } catch (error) {
                console.error('[ShopGuard] Failed to fetch my shop info.', error);
                setError(true);
            } finally {
                setIsChecking(false);
            }
        };

        checkAccess();
    }, [user, isLoading, shopId]);

    if (isLoading || isChecking) {
        return <div style={{ display: 'flex', justifyContent: 'center', marginTop: 100 }}><Spin size="large" /></div>;
    }

    // 1. Not Logged In -> Redirect to Login
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 2. No Shop Data (Error or New User) -> Redirect to Home (or specific page)
    if (error || !myShopId) {
        // If we really can't find a shop, go to root. HomeRedirect might try again or show error.
        return <Navigate to="/" replace />;
    }

    // 3. Shop Mismatch -> Redirect to My Shop
    if (shopId && String(shopId) !== String(myShopId)) {
        // Replace shopId in the current path with myShopId
        // e.g. /shops/1/schedule -> /shops/2/schedule
        const newPath = location.pathname.replace(`/shops/${shopId}`, `/shops/${myShopId}`);
        return <Navigate to={newPath} replace />;
    }

    return children;
};

export default ShopGuard;
