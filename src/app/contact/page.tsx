"use client";

import React, { useState } from "react";
import { db } from "@/lib/data-store";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, MapPin, CheckCircle2, HelpCircle } from "lucide-react";

import { useAuth } from "@/context/auth-context";

export default function ContactPage() {
  const { user } = useAuth();
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("GENERAL");
  const [priority, setPriority] = useState<"LOW" | "NORMAL" | "HIGH" | "URGENT">("NORMAL");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const ticket = db.createSupportTicket({
      user_id: user?.id || "guest-support",
      subject,
      category,
      priority,
      status: "OPEN",
      description,
    });

    setSubmitted(ticket.id);
    setIsSubmitting(false);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-14 max-w-4xl space-y-12">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <span className="text-xs uppercase font-bold tracking-widest text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
          Support & Inquiries
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight text-navy-950">
          Contact Levchary Support
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          Need assistance with a booking, dispute resolution, or classroom location? Our support team is here to assist.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Contact Info Sidebar */}
        <div className="space-y-4">
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-navy-950">Administrative Offices</h3>
            
            <div className="flex items-start gap-3 text-xs text-slate-600">
              <MapPin className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <span>100 Main Street, Suite 400<br />Boston, MA 02110</span>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-600">
              <Mail className="w-4 h-4 text-teal-600 shrink-0" />
              <span>support@levchary.com</span>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-600">
              <Phone className="w-4 h-4 text-teal-600 shrink-0" />
              <span>+1 (617) 555-0100</span>
            </div>
          </div>

          <div className="p-4 bg-teal-50/50 rounded-xl border border-teal-100 text-xs text-teal-900 space-y-1">
            <strong className="block font-semibold">Live Ticket Tracking</strong>
            Tickets submitted through this form are logged directly in the Admin Support Center.
          </div>
        </div>

        {/* Ticket Submission Form */}
        <div className="md:col-span-2">
          {submitted ? (
            <div className="p-8 bg-white rounded-2xl border border-emerald-200 text-center space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-navy-950">Ticket Dispatched</h3>
              <p className="text-xs text-slate-500">
                Your support ticket has been submitted to the Admin Support Queue under ID: <strong>{submitted}</strong>. Our team typically responds within 4 business hours.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSubmitted(null);
                  setSubject("");
                  setDescription("");
                }}
              >
                Submit Another Request
              </Button>
            </div>
          ) : (
            <Card className="border-slate-200 shadow-xs">
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Subject
                    </label>
                    <Input
                      placeholder="e.g. Question regarding rescheduling virtual booking"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Category
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full h-10 px-3 text-xs border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-teal-600 outline-none"
                      >
                        <option value="GENERAL">General Inquiries</option>
                        <option value="BOOKINGS">Bookings & Scheduling</option>
                        <option value="PAYMENTS">Payments & Refunds</option>
                        <option value="LOCATIONS">Physical Learning Hubs</option>
                        <option value="TECHNICAL">Technical / Google Meet</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Priority
                      </label>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as any)}
                        className="w-full h-10 px-3 text-xs border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-teal-600 outline-none"
                      >
                        <option value="LOW">Low</option>
                        <option value="NORMAL">Normal</option>
                        <option value="HIGH">High</option>
                        <option value="URGENT">Urgent (Class within 24h)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Description & Details
                    </label>
                    <Textarea
                      placeholder="Please provide full details including booking numbers if applicable..."
                      rows={5}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="default"
                    disabled={isSubmitting}
                    className="w-full font-semibold"
                  >
                    {isSubmitting ? "Dispatching..." : "Submit Support Ticket"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
