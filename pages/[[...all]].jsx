import dynamic from "next/dynamic";

// Load the client app only in the browser; on the server it renders a safe placeholder.
const ClientApp = dynamic(() => import("../src/ClientApp"), { ssr: false });

export default function CatchAll() {
  return <ClientApp />;
}
