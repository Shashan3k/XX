"use client";

import * as React from "react";
import { CHIT_PLANS, CONTACT, ENQUIRY, UI_STRINGS, normalizeIndianMobile } from "@/data/panasunaData";
import { submitEnquiry } from "@/app/actions/enquiry";
import { useLocale } from "@/lib/i18n";
import { pageScroll } from "@/components/providers/SmoothScroll";
import { PanasunaLogo } from "@/components/brand/PanasunaLogo";
import { PlanSelect, planLabel } from "@/components/plans/PlanSelect";
import { Button } from "@/components/ui/button";
import { Dialog, DialogDescription, DialogFooter, DialogHeader, DialogPanel, DialogPopup, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

interface EnquiryContextValue {
  /** Opens the Join Enquiry modal, optionally with a scheme pre-selected. */
  openEnquiry: (planId?: string) => void;
}

const EnquiryContext = React.createContext<EnquiryContextValue | null>(null);

export function useEnquiry(): EnquiryContextValue {
  const ctx = React.use(EnquiryContext);
  if (!ctx) throw new Error("useEnquiry must be used inside <EnquiryProvider>");
  return ctx;
}

const MOBILE = CONTACT.phones.find((p) => p.id === "mobile")!;

/** One modal for the whole site: the wizard, plan cards, catalogue and calculator all open it. */
export function EnquiryProvider({ children }: { children: React.ReactNode }) {
  const { t } = useLocale();
  const [open, setOpen] = React.useState(false);
  const [planId, setPlanId] = React.useState<string | null>(null);
  // A fresh form per opening, so a previous visitor's half-typed entry never reappears.
  const [session, setSession] = React.useState(0);

  const openEnquiry = React.useCallback((id?: string) => {
    setPlanId(id ?? null);
    setSession((n) => n + 1);
    setOpen(true);
    pageScroll.lock();
  }, []);

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) pageScroll.unlock();
  };

  const value = React.useMemo(() => ({ openEnquiry }), [openEnquiry]);

  return (
    <EnquiryContext value={value}>
      {children}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogPopup data-lenis-prevent closeProps={{ "aria-label": t(ENQUIRY.close) }} className="sm:max-w-md">
          <EnquiryForm key={session} initialPlanId={planId} onDone={() => onOpenChange(false)} />
        </DialogPopup>
      </Dialog>
    </EnquiryContext>
  );
}

type Errors = Partial<Record<"name" | "mobile" | "scheme", true>>;

function EnquiryForm({ initialPlanId, onDone }: { initialPlanId: string | null; onDone: () => void }) {
  const { t, locale } = useLocale();
  const [planId, setPlanId] = React.useState(initialPlanId);
  const [name, setName] = React.useState("");
  const [mobile, setMobile] = React.useState("");
  const [errors, setErrors] = React.useState<Errors>({});
  const [status, setStatus] = React.useState<"idle" | "sent" | "failed">("idle");
  const [pending, startTransition] = React.useTransition();
  const plan = CHIT_PLANS.find((p) => p.id === planId);
  const schemeRef = React.useRef<HTMLButtonElement>(null);
  const nameRef = React.useRef<HTMLInputElement>(null);
  const mobileRef = React.useRef<HTMLInputElement>(null);
  const doneRef = React.useRef<HTMLHeadingElement>(null);

  // The submit button disappears when the confirmation replaces the form; without this, focus falls
  // to <body> and a screen-reader user never hears that the request went through.
  React.useEffect(() => {
    if (status === "sent") doneRef.current?.focus();
  }, [status]);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const next: Errors = {};
    if (name.trim().length < 2) next.name = true;
    if (!normalizeIndianMobile(mobile)) next.mobile = true;
    if (!plan) next.scheme = true;
    setErrors(next);
    if (Object.keys(next).length) {
      // In field order. (Querying [aria-invalid] here finds nothing: React hasn't re-rendered yet.)
      (next.scheme ? schemeRef : next.name ? nameRef : mobileRef).current?.focus();
      return;
    }
    startTransition(async () => {
      const res = await submitEnquiry({ name, mobile, planId: plan!.id, locale });
      setStatus(res.ok ? "sent" : "failed");
    });
  };

  if (status === "sent" && plan) {
    return (
      <>
        <DialogHeader className="items-center pt-8 text-center">
          <PanasunaLogo variant="seal" className="size-16 text-gold-ink" />
          <DialogTitle ref={doneRef} tabIndex={-1} className="mt-2 font-sans text-2xl font-semibold outline-none">
            {t(UI_STRINGS.joinConfirmation.title)}
          </DialogTitle>
          <DialogDescription className="text-base">{t(UI_STRINGS.joinConfirmation.body)}</DialogDescription>
          <p className="mt-1 text-sm text-foreground tabular-nums lining-nums">{planLabel(plan, locale)}</p>
        </DialogHeader>
        <DialogFooter variant="bare">
          <Button size="lg" className="w-full" onClick={onDone}>
            {t(UI_STRINGS.joinConfirmation.dismiss)}
          </Button>
        </DialogFooter>
      </>
    );
  }

  return (
    <form noValidate onSubmit={submit} className="contents">
      <DialogHeader>
        <DialogTitle className="pe-8 font-sans text-2xl font-semibold">{t(ENQUIRY.title)}</DialogTitle>
        <DialogDescription>{t(ENQUIRY.lead)}</DialogDescription>
      </DialogHeader>
      <DialogPanel className="flex flex-col gap-5">
        <Field invalid={errors.scheme}>
          <FieldLabel htmlFor="enquiry-scheme">{t(ENQUIRY.scheme)}</FieldLabel>
          <PlanSelect
            ref={schemeRef}
            id="enquiry-scheme"
            value={planId}
            invalid={errors.scheme}
            onValueChange={(id) => {
              setPlanId(id);
              setErrors((x) => ({ ...x, scheme: undefined }));
            }}
          />
          {errors.scheme && <FieldError match>{t(ENQUIRY.errors.scheme)}</FieldError>}
        </Field>
        <Field invalid={errors.name}>
          <FieldLabel>{t(ENQUIRY.name)}</FieldLabel>
          <Input
            ref={nameRef}
            size="lg"
            autoComplete="name"
            value={name}
            aria-invalid={errors.name || undefined}
            onChange={(e) => setName(e.target.value)}
          />
          {errors.name && <FieldError match>{t(ENQUIRY.errors.name)}</FieldError>}
        </Field>
        <Field invalid={errors.mobile}>
          <FieldLabel>{t(ENQUIRY.mobile)}</FieldLabel>
          <Input
            ref={mobileRef}
            size="lg"
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            value={mobile}
            aria-invalid={errors.mobile || undefined}
            onChange={(e) => setMobile(e.target.value)}
            className="tabular-nums"
          />
          {errors.mobile ? (
            <FieldError match>{t(ENQUIRY.errors.mobile)}</FieldError>
          ) : (
            <FieldDescription>{t(ENQUIRY.mobileHint)}</FieldDescription>
          )}
        </Field>
        <p className="text-xs text-muted-foreground">{t(ENQUIRY.privacy)}</p>
        {status === "failed" && (
          <p role="alert" className="rounded-lg border border-destructive/40 px-3 py-2 text-sm text-destructive-foreground">
            {t(ENQUIRY.errors.failed)}{" "}
            <a href={`tel:${MOBILE.tel}`} className="font-semibold whitespace-nowrap underline underline-offset-2">
              {MOBILE.display}
            </a>
          </p>
        )}
      </DialogPanel>
      <DialogFooter>
        <p className="text-sm text-muted-foreground sm:me-auto sm:self-center">
          {t(ENQUIRY.callInstead)}{" "}
          <a href={`tel:${MOBILE.tel}`} className="font-semibold whitespace-nowrap text-foreground tabular-nums underline-offset-2 hover:underline">
            {MOBILE.display}
          </a>
        </p>
        <Button type="submit" size="lg" disabled={pending}>
          {pending && <Spinner />}
          {pending ? t(ENQUIRY.sending) : t(UI_STRINGS.joinForm.submit)}
        </Button>
      </DialogFooter>
    </form>
  );
}
