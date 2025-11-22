"use client"
import { useGameEngine } from "@/components/game-enginge-context";
import { Button } from "@/components/ui/button";
import {Card} from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { DialogDescription, DialogTitle, DialogTrigger } from "@radix-ui/react-dialog";

export default function Simulation() {
  const gameEngine = useGameEngine();


  return (
    <main className="grid grid-cols-12 gap-4 p-4 h-screen">
      <Card className="col-span-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button>Actions</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Actions</DialogTitle>
              <DialogDescription>Decide which action you want to choose next</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <Button onClick={() => null}>Move</Button>
              <Button onClick={() => null}>Change Occupation</Button>
              <Button onClick={() => null}>Manage Portfolio</Button>
              <Button onClick={() => null}>Take a Loan</Button>
            </div>
          </DialogContent>
        </Dialog>
      </Card>
      <Card className="col-span-8"></Card>
      <Card className="col-span-2"></Card>
    </main>
  );
}
