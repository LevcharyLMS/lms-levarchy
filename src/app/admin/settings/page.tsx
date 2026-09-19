"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Settings, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function AdminSettingsPage() {
  const [platformName, setPlatformName] = useState("Levchary LMS");
  const [supportEmail, setSupportEmail] = useState("support@levchary.com");
  const [cancelHours, setCancelHours] = useState(24);
  const [fullRefundHours, setFullRefundHours] = useState(48);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy-950">
          Platform Configuration & Marketplace Rules
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Global platform parameters, refund time windows, and communication channels.
        </p>
      </div>

      {saved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Platform configuration updated and saved.</span>
        </div>
      )}

      <Card className="border-slate-200 shadow-xs">
        <CardContent className="p-6">
          <form onSubmit={handleSave} className="space-y-4">
            <h2 className="text-sm font-bold text-navy-950 flex items-center gap-2 pb-2 border-b border-slate-100">
              <Settings className="w-4 h-4 text-purple-700" /> General Marketplace Parameters
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Platform Name
                </label>
                <Input value={platformName} onChange={(e) => setPlatformName(e.target.value)} required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Administrative Support Email
                </label>
                <Input type="email" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Free Cancellation Window (Hours Prior)
                </label>
                <Input
                  type="number"
                  value={cancelHours}
                  onChange={(e) => setCancelHours(Number(e.target.value))}
                  min={6}
                  max={72}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Automatic Full Refund Window (Hours Prior)
                </label>
                <Input
                  type="number"
                  value={fullRefundHours}
                  onChange={(e) => setFullRefundHours(Number(e.target.value))}
                  min={12}
                  max={96}
                  required
                />
              </div>
            </div>

            <Button type="submit" variant="default" className="font-semibold bg-purple-900 hover:bg-purple-800">
              Save Platform Configuration
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
