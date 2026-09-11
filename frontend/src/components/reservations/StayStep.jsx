import { useState } from 'react'
import { CalendarDays, Minus, Plus } from 'lucide-react'

export default function StayStep({
    form,
    onChange,
    onBack,
    onContinue,
}) {
    const [errors, setErrors] = useState({})

    const calculateNights = () => {
        if (!form.check_in_date || !form.check_out_date) {
            return 0
        }

        const checkIn = new Date(`${form.check_in_date}T00:00:00`)
        const checkOut = new Date(`${form.check_out_date}T00:00:00`)

        const difference = checkOut - checkIn
        const nights = Math.ceil(
            difference / (1000 * 60 * 60 * 24)
        )

        return nights > 0 ? nights : 0
    }

    const nights = calculateNights()

    const handleDateChange = (field, value) => {
        onChange({
            [field]: value,
        })

        // Clear error for this field when user changes it
        setErrors((previous) => ({
            ...previous,
            [field]: '',
        }))

        // If check-in changes, re-check checkout relationship
        if (field === 'check_in_date') {
            setErrors((previous) => ({
                ...previous,
                check_in_date: '',
                check_out_date: '',
            }))
        }
    }

    const handleGuestCount = (field, amount) => {
        const currentValue = Number(form[field] || 0)
        const newValue = currentValue + amount

        if (field === 'adults') {
            onChange({
                [field]: Math.max(1, newValue),
            })
        } else {
            onChange({
                [field]: Math.max(0, newValue),
            })
        }

        // Clear adult error if user changes the count
        if (field === 'adults') {
            setErrors((previous) => ({
                ...previous,
                adults: '',
            }))
        }
    }

    const validate = () => {
        const newErrors = {}

        if (!form.check_in_date) {
            newErrors.check_in_date =
                'Please select check-in date.'
        }

        if (!form.check_out_date) {
            newErrors.check_out_date =
                'Please select check-out date.'
        }

        if (
            form.check_in_date &&
            form.check_out_date &&
            nights <= 0
        ) {
            newErrors.check_out_date =
                'Check-out date must be after check-in date.'
        }

        if (Number(form.adults || 0) < 1) {
            newErrors.adults =
                'At least 1 adult is required.'
        }

        setErrors(newErrors)

        return Object.keys(newErrors).length === 0
    }

    const handleContinue = () => {
        if (!validate()) {
            return
        }

        onContinue?.()
    }

    return (
        <div className="space-y-6">

            {/* Header */}
            <div>
                <h2 className="text-xl font-semibold text-white">
                    Stay Details
                </h2>

                <p className="text-sm text-slate-400 mt-1">
                    Select the guest's stay dates and number of guests.
                </p>
            </div>

            {/* Date Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* Check In */}
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        Check-in Date
                        <span className="text-rose-400 ml-1">*</span>
                    </label>

                    <div className="relative">
                        <CalendarDays
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                        />

                        <input
                            type="date"
                            value={form.check_in_date || ''}
                            min={new Date().toISOString().split('T')[0]}
                            onChange={(e) =>
                                handleDateChange(
                                    'check_in_date',
                                    e.target.value
                                )
                            }
                            className={`w-full bg-base-800 border ${
                                errors.check_in_date
                                    ? 'border-rose-500 focus:border-rose-500'
                                    : 'border-base-border focus:border-amber-400'
                            } text-white rounded-lg pl-10 pr-3 py-3 text-sm outline-none transition-colors`}
                        />
                    </div>

                    {errors.check_in_date && (
                        <p className="text-xs text-rose-400 mt-1.5">
                            {errors.check_in_date}
                        </p>
                    )}
                </div>

                {/* Check Out */}
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        Check-out Date
                        <span className="text-rose-400 ml-1">*</span>
                    </label>

                    <div className="relative">
                        <CalendarDays
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                        />

                        <input
                            type="date"
                            value={form.check_out_date || ''}
                            min={
                                form.check_in_date ||
                                new Date().toISOString().split('T')[0]
                            }
                            onChange={(e) =>
                                handleDateChange(
                                    'check_out_date',
                                    e.target.value
                                )
                            }
                            className={`w-full bg-base-800 border ${
                                errors.check_out_date
                                    ? 'border-rose-500 focus:border-rose-500'
                                    : 'border-base-border focus:border-amber-400'
                            } text-white rounded-lg pl-10 pr-3 py-3 text-sm outline-none transition-colors`}
                        />
                    </div>

                    {errors.check_out_date && (
                        <p className="text-xs text-rose-400 mt-1.5">
                            {errors.check_out_date}
                        </p>
                    )}
                </div>
            </div>

            {/* Nights Summary */}
            <div className="bg-base-800 border border-base-border rounded-xl p-5">
                <div className="flex items-center justify-between">

                    <div>
                        <p className="text-sm text-slate-400">
                            Length of stay
                        </p>

                        <p className="text-lg font-semibold text-white mt-1">
                            {nights > 0
                                ? `${nights} night${nights !== 1 ? 's' : ''}`
                                : '—'}
                        </p>
                    </div>

                    <div className="w-10 h-10 rounded-lg bg-amber-400/10 flex items-center justify-center">
                        <CalendarDays
                            size={20}
                            className="text-amber-400"
                        />
                    </div>
                </div>
            </div>

            {/* Guests */}
            <div>
                <h3 className="text-base font-semibold text-white mb-4">
                    Guests
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* Adults */}
                    <div>
                        <div className="bg-base-800 border border-base-border rounded-xl p-4">
                            <div className="flex items-center justify-between">

                                <div>
                                    <p className="text-sm font-medium text-white">
                                        Adults
                                    </p>

                                    <p className="text-xs text-slate-500 mt-1">
                                        Age 13+
                                    </p>
                                </div>

                                <div className="flex items-center gap-3">

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleGuestCount(
                                                'adults',
                                                -1
                                            )
                                        }
                                        disabled={
                                            Number(
                                                form.adults || 1
                                            ) <= 1
                                        }
                                        className="w-9 h-9 rounded-lg border border-base-border bg-base-900 text-slate-300 flex items-center justify-center hover:bg-base-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Minus size={16} />
                                    </button>

                                    <span className="w-6 text-center text-white font-semibold">
                                        {form.adults || 1}
                                    </span>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleGuestCount(
                                                'adults',
                                                1
                                            )
                                        }
                                        className="w-9 h-9 rounded-lg border border-base-border bg-base-900 text-slate-300 flex items-center justify-center hover:bg-base-700 transition-colors"
                                    >
                                        <Plus size={16} />
                                    </button>

                                </div>
                            </div>
                        </div>

                        {errors.adults && (
                            <p className="text-xs text-rose-400 mt-1.5">
                                {errors.adults}
                            </p>
                        )}
                    </div>

                    {/* Children */}
                    <div className="bg-base-800 border border-base-border rounded-xl p-4">
                        <div className="flex items-center justify-between">

                            <div>
                                <p className="text-sm font-medium text-white">
                                    Children
                                </p>

                                <p className="text-xs text-slate-500 mt-1">
                                    Age 0–12
                                </p>
                            </div>

                            <div className="flex items-center gap-3">

                                <button
                                    type="button"
                                    onClick={() =>
                                        handleGuestCount(
                                            'children',
                                            -1
                                        )
                                    }
                                    disabled={
                                        Number(
                                            form.children || 0
                                        ) <= 0
                                    }
                                    className="w-9 h-9 rounded-lg border border-base-border bg-base-900 text-slate-300 flex items-center justify-center hover:bg-base-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Minus size={16} />
                                </button>

                                <span className="w-6 text-center text-white font-semibold">
                                    {form.children || 0}
                                </span>

                                <button
                                    type="button"
                                    onClick={() =>
                                        handleGuestCount(
                                            'children',
                                            1
                                        )
                                    }
                                    className="w-9 h-9 rounded-lg border border-base-border bg-base-900 text-slate-300 flex items-center justify-center hover:bg-base-700 transition-colors"
                                >
                                    <Plus size={16} />
                                </button>

                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4 border-t border-base-border">

                <button
                    type="button"
                    onClick={onBack}
                    className="px-5 py-2.5 rounded-lg border border-base-border bg-base-800 hover:bg-base-700 text-slate-200 text-sm font-medium transition-colors"
                >
                    Back
                </button>

                <button
                    type="button"
                    onClick={handleContinue}
                    className="px-5 py-2.5 rounded-lg bg-amber-400 hover:bg-amber-500 text-base-950 font-semibold text-sm transition-colors"
                >
                    Continue
                </button>

            </div>
        </div>
    )
}