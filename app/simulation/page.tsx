import {Card} from "@/components/ui/card";

export default function Simulation() {
  return (
    <main className="grid grid-cols-12 gap-4 p-4 h-screen">
      <Card className="col-span-2"></Card>
      <Card className="col-span-8"></Card>
      <Card className="col-span-2"></Card>
    </main>
  );
}
