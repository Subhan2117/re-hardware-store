import { NextResponse } from "next/server";

const FEDEX_CLIENT_ID = process.env.FEDEX_CLIENT_ID
const FEDEX_CLIENT_SECRET = process.env.FEDEX_CLIENT_SECRET

async function getFedexToken() {
    const resp = await fetch("https://apis-sandbox.fedex.com/oauth/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
            grant_type: "client_credentials",
            client_id: FEDEX_CLIENT_ID,
            client_secret: FEDEX_CLIENT_SECRET
        })
    });

    if (!resp.ok) {
        console.log("FedEx token error:", await resp.text());
        throw new Error("Failed to get FedEx OAuth token");
    }

    return resp.json();
}

async function trackPackage(trackingNumber, token) {
    const resp = await fetch("https://apis-sandbox.fedex.com/track/v1/trackingnumbers", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
            trackingInfo: [
                {
                    trackingNumberInfo: {
                        trackingNumber
                    }
                }
            ]
        })
    });

    if (!resp.ok) {
        console.log("FedEx tracking error:", await resp.text());
        throw new Error("FedEx tracking failed");
    }

    return resp.json();
}

export async function POST(req) {
    try {
        const { trackingNumber } = await req.json();

        const tokenData = await getFedexToken();
        const accessToken = tokenData.access_token;

        const trackingData = await trackPackage(trackingNumber, accessToken);

        return NextResponse.json({ success: true, trackingData });
    } catch (err) {
        console.log("FedEx API error:", err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 })
    }
}