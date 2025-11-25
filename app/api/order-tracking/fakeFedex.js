// fakeFedex.js
import express from "express";

const app = express();
app.use(express.json());

// Example fake tracking data
const fakeEvents = [
  { eventDescription: "Shipment information sent to FedEx", date: "2025-11-22T10:00:00Z" },
  { eventDescription: "Picked up", date: "2025-11-22T13:15:00Z" },
  { eventDescription: "In transit - Memphis, TN", date: "2025-11-23T08:30:00Z" },
  { eventDescription: "Out for delivery", date: "2025-11-23T14:00:00Z" },
  { eventDescription: "Delivered", date: "2025-11-23T17:45:00Z" }
];

// API route to simulate FedEx tracking
app.post("/track/v1/trackingnumbers", (req, res) => {
  const trackingNumber = req.body?.trackingInfo?.[0]?.trackingNumberInfo?.trackingNumber;

  if (!trackingNumber) {
    return res.status(400).json({ error: "Tracking number missing" });
  }

  res.json({
    output: {
      completeTrackResults: [
        {
          trackingNumber,
          trackResults: [
            {
              latestStatusDetail: {
                statusByLocale: "Delivered",
                description: "Delivered to recipient"
              },
              scanEvents: fakeEvents
            }
          ]
        }
      ]
    }
  });
});

app.listen(4000, () => {
  console.log("🚚 Fake FedEx tracking API running at http://localhost:4000");
});
