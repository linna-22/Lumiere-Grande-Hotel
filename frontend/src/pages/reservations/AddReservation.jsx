import { useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Loader2,
  CheckCircle2,
} from "lucide-react";

import Sidebar from "../../components/layout/Sidebar";
import TopBar from "../../components/layout/TopBar";

import ReservationStepper from "../../components/reservations/ReservationStepper";
import GuestStep from "../../components/reservations/GuestStep";
import StayStep from "../../components/reservations/StayStep";
import RoomStep from "../../components/reservations/RoomStep";
import PaymentStep from "../../components/reservations/PaymentStep";
import SuccessModal from "../../components/rooms/SuccessModal";
import ErrorModal from "../../components/common/ErrorModal";
import { createReservation } from "../../api/admin";

export default function AddReservation({ onNavigate }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [currentStep, setCurrentStep] = useState(1);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const [form, setForm] = useState({
    // Guest
    guest_id: null,

    guest_details: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      id_type: "",
      id_number: "",
      nationality: "",
    },

    selectedGuest: null,

    // Stay
    check_in_date: "",
    check_out_date: "",

    adults: 1,
    children: 0,

    // Rooms
    rooms: [],

    // Charges
    tax: 0,
    discount: 0,

    // Payment
    payment_option: "full",
    payment_method: "bakong_khqr",

    // Created reservation / invoice
    reservation_id: null,
    invoice_id: null,
  });

  const updateForm = (data) => {
    setForm((previous) => ({
      ...previous,
      ...data,
    }));

    // Clear submission error when user changes the form
    if (submitError) {
      setSubmitError("");
    }
  };

  const handleBack = () => {
    if (submitting) {
      return;
    }

    if (currentStep === 1) {
      onNavigate?.("Reservations");
      return;
    }

    setCurrentStep((step) => step - 1);
  };

  const handleNext = async () => {
    if (submitting) {
      return;
    }

    // Room step → create reservation first, then go to payment.
    if (currentStep === 3) {
      await handleCreateReservation();
      return;
    }

    setCurrentStep((step) => Math.min(4, step + 1));
  };

  /*
   * Final reservation submission
   */
  const handleCreateReservation = async () => {
    if (submitting) {
      return;
    }

    setSubmitError("");
    setSuccessMessage("");
    setShowErrorModal(false);

    // Basic frontend safety check
    if (!form.guest_id && !form.guest_details?.first_name) {
      setSubmitError("Please complete the guest information.");
      setCurrentStep(1);
      return;
    }

    if (!form.check_in_date || !form.check_out_date) {
      setSubmitError("Please complete the stay information.");
      setCurrentStep(2);
      return;
    }

    if (!form.rooms || form.rooms.length === 0) {
      setSubmitError("Please select at least one room.");
      setCurrentStep(3);
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        guest_id: form.guest_id || null,

        ...(form.guest_id
          ? {}
          : {
              guest_details: {
                first_name: form.guest_details?.first_name || "",
                last_name: form.guest_details?.last_name || "",
                email: form.guest_details?.email || "",
                phone: form.guest_details?.phone || "",
                id_type: form.guest_details?.id_type || "",
                id_number: form.guest_details?.id_number || "",
                nationality: form.guest_details?.nationality || "",
              },
            }),

        check_in_date: form.check_in_date,
        check_out_date: form.check_out_date,

        adults: Number(form.adults || 1),
        children: Number(form.children || 0),

        rooms: form.rooms.map((room) => ({
          room_type_id: Number(room.room_type_id),
          room_id: room.room_id ? Number(room.room_id) : null,
          nightly_rate: Number(room.nightly_rate || 0),
        })),

        tax: Number(form.tax || 0),
        discount: Number(form.discount || 0),
        payment_option: form.payment_option,
        payment_method: form.payment_method,
      };

      console.log("Creating reservation:", payload);

      const response = await createReservation(payload);

      console.log("Reservation created:", response);

      // Support common Laravel response structures.
      const reservationId =
        response?.reservation_id ??
        response?.reservation?.id ??
        response?.data?.reservation_id ??
        response?.data?.reservation?.id;

      const invoiceId =
        response?.invoice_id ??
        response?.invoice?.id ??
        response?.data?.invoice_id ??
        response?.data?.invoice?.id;

      console.log("Reservation ID:", reservationId);
      console.log("Invoice ID:", invoiceId);

      if (!reservationId) {
        throw new Error(
          "Reservation was created, but reservation ID was not returned by the API."
        );
      }

      if (!invoiceId) {
        throw new Error(
          "Reservation was created, but invoice ID was not returned by the API."
        );
      }

      // Save IDs for PaymentStep.
      setForm((previous) => ({
        ...previous,
        reservation_id: reservationId,
        invoice_id: invoiceId,
      }));

      // Go to payment only after IDs are available.
      setCurrentStep(4);
    } catch (error) {
      console.error("Failed to create reservation:", error);

      // Keep the API's useful business message (for example,
      // "Room 101 has already been booked") but show it in a modal
      // instead of displaying the error inline on the page.
      const apiMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to create reservation. Please try again.";

      setSubmitError(apiMessage);
      setShowErrorModal(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentComplete = () => {
    setSuccessMessage(
      "Reservation and payment completed successfully."
    );

    setShowSuccessModal(true);

    setTimeout(() => {
      onNavigate?.("Reservations");
    }, 1200);
  };

  return (
    <div className="flex bg-base-850 min-h-screen">
      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        active="Reservations"
        onNavigate={onNavigate}
      />

      {/* Main */}
      <div className="flex-1 min-w-0">
        <TopBar
          onMenuClick={() => setSidebarOpen(true)}
          onNavigate={onNavigate}
        />

        <main className="p-4 sm:p-6 max-w-[1200px] mx-auto">
          {/* Back */}
          <button
            type="button"
            onClick={handleBack}
            disabled={submitting}
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-5"
          >
            <ArrowLeft size={16} />
            Back to Reservations
          </button>

          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <CalendarDays size={22} className="text-amber-400" />

              <h1 className="text-2xl sm:text-3xl font-bold text-white font-serif">
                Create Reservation
              </h1>
            </div>

            <p className="text-sm text-slate-400 mt-1">
              Create a new hotel reservation step by step.
            </p>
          </div>

          {/* Stepper */}
          <div className="bg-base-850 border border-base-border rounded-xl p-5 sm:p-6 mb-6">
            <ReservationStepper
              currentStep={currentStep}
              onStepClick={(step) => {
                if (!submitting) {
                  setCurrentStep(step);
                }
              }}
            />
          </div>


          {/* Success */}
          {successMessage && (
            <div className="mb-6 flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
              <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />

              <p className="text-sm text-emerald-300">{successMessage}</p>
            </div>
          )}

          {/* Content */}
          <div className="bg-base-850 border border-base-border rounded-xl">
            <div className="p-5 sm:p-6">
              {/* ==========================================
                  STEP 1 — GUEST
              ========================================== */}
              {currentStep === 1 && (
                <GuestStep
                  guestData={form}
                  onChange={updateForm}
                  onNext={handleNext}
                />
              )}

              {/* ==========================================
                  STEP 2 — STAY
              ========================================== */}
              {currentStep === 2 && (
                <StayStep
                  form={form}
                  onChange={updateForm}
                  onBack={() => setCurrentStep(1)}
                  onContinue={() => setCurrentStep(3)}
                />
              )}

              {/* ==========================================
                  STEP 3 — ROOM
              ========================================== */}
              {currentStep === 3 && (
                <RoomStep
                  form={form}
                  onChange={updateForm}
                  onBack={() => setCurrentStep(2)}
                  onContinue={handleNext}
                  submitting={submitting}
                />
              )}

              {/* ==========================================
                  STEP 4 — PAYMENT
              ========================================== */}
              {currentStep === 4 && (
                <PaymentStep
                  form={form}
                  onChange={updateForm}
                  onBack={() => setCurrentStep(3)}
                  onContinue={handlePaymentComplete}
                />
              )}
            </div>
          </div>

          {/* Submitting Overlay / Status */}
          {submitting && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-400">
              <Loader2 size={16} className="animate-spin" />

              <span>Creating reservation...</span>
            </div>
          )}
        </main>
      </div>
      {showSuccessModal && (
        <SuccessModal
          message={successMessage}
          onClose={() => {
            setShowSuccessModal(false);
            onNavigate?.("Reservations");
          }}
        />
      )}
      {showErrorModal && (
        <ErrorModal
          title="Reservation could not be created"
          message={submitError}
          onClose={() => setShowErrorModal(false)}
        />
      )}
    </div>
  );
}
