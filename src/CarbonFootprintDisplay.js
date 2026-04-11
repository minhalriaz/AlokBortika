import { useCarbonFootprint } from "react-carbon-footprint";

export default function CarbonFootprintDisplay() {
  const [gCO2, bytesTransferred] = useCarbonFootprint();

  return (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        background: "black",
        color: "white",
        padding: "10px",
        borderRadius: "8px",
        zIndex: 9999,
        fontSize: "12px",
      }}
    >
      <div>Bytes: {bytesTransferred}</div>
      <div>CO₂: {gCO2?.toFixed(2)} g</div>
    </div>
  );
}