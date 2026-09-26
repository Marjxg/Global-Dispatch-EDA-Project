
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Plus, Trash2, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { z } from "zod";
import { submitOrder } from "@/services/orderApi";

import {
    orderSchema,
    type OrderFormValues,
} from "@/features/orders/schemas/orderSchema";

export default function NewOrder() {
    const [submitted, setSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [submittedOrderId, setSubmittedOrderId] = useState("");

    const {
        register,
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<
        z.input<typeof orderSchema>,
        unknown,
        z.output<typeof orderSchema>
    >({
        resolver: zodResolver(orderSchema),
        defaultValues: {
            shipperOrderId: "",
            pickupDate: "",
            deliveryDate: "",
            price: 0,
            stops: [
                { stopNumber: 1, city: "", state: "", postalCode: "" },
                { stopNumber: 2, city: "", state: "", postalCode: "" },
            ],
            vehicles: [{ year: "", make: "", model: "" }],
            transportationReleaseNotes: "",
        },
    });

    const {
        fields: stops,
        append: appendStop,
        remove: removeStop,
    } = useFieldArray({ control, name: "stops" });

    const {
        fields: vehicles,
        append: appendVehicle,
        remove: removeVehicle,
    } = useFieldArray({ control, name: "vehicles" });

    const onSubmit = async (data: OrderFormValues) => {
        setSubmitError("");
        setSubmitted(false);

        try {
            const result = await submitOrder({
                ...data,
                stops: data.stops.map((stop, index) => ({
                    ...stop,
                    stopNumber: index + 1,
                })),
            });

            setSubmittedOrderId(result.shipperOrderId);
            setSubmitted(true);
            reset();
        } catch (error) {
            setSubmitError(
                error instanceof Error
                    ? error.message
                    : "Unable to submit the request."
            );
        }
    };

    return (
        <div className="mx-auto max-w-5xl space-y-6">
            <div>
                <Link
                    to="/orders"
                    className="mb-3 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600"
                >
                    <ArrowLeft size={16} />
                    Back to requests
                </Link>

                <h1 className="text-2xl font-bold text-slate-900">
                    New Transportation Request
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                    Complete the information below to request vehicle transportation.
                </p>
            </div>

            {submitted && (
                <div
                    role="status"
                    className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
                >
                    Request #{submittedOrderId} submitted successfully.
                    Its validation result will be available in My Requests.
                </div>
            )}

            {submitError && (
                <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
                >
                    {submitError}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* General information */}
                <Card>
                    <CardHeader>
                        <CardTitle>General Information</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-5 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="orderId">Order ID</Label>
                            <Input
                                id="orderId"
                                placeholder="6600111"
                                {...register("shipperOrderId")}
                            />
                            {errors.shipperOrderId && (
                                <p className="text-sm text-red-600">
                                    {errors.shipperOrderId.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="price">Transportation Price (USD)</Label>
                            <Input
                                id="price"
                                type="number"
                                min="0"
                                step="0.01"
                                {...register("price")}
                            />
                            {errors.price && (
                                <p className="text-sm text-red-600">
                                    {errors.price.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="pickup">Pickup Date</Label>
                            <Input
                                id="pickup"
                                type="date"
                                {...register("pickupDate")}
                            />
                            {errors.pickupDate && (
                                <p className="text-sm text-red-600">
                                    {errors.pickupDate.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="delivery">Delivery Date</Label>
                            <Input
                                id="delivery"
                                type="date"
                                {...register("deliveryDate")}
                            />
                            {errors.deliveryDate && (
                                <p className="text-sm text-red-600">
                                    {errors.deliveryDate.message}
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Stops */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between gap-3">
                            <CardTitle>Stops</CardTitle>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                    appendStop({
                                        stopNumber: stops.length + 1,
                                        city: "",
                                        state: "",
                                        postalCode: "",
                                    })
                                }
                            >
                                <Plus size={16} />
                                Add Stop
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {stops.map((stop, index) => (
                            <div
                                key={stop.id}
                                className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                            >
                                <div className="mb-4 flex items-center justify-between">
                                    <h3 className="font-semibold text-slate-800">
                                        Stop {index + 1}
                                        {index === 0 ? " — Pickup" : ""}
                                        {index === stops.length - 1 && index !== 0
                                            ? " — Delivery"
                                            : ""}
                                    </h3>

                                    {stops.length > 2 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            aria-label={`Remove stop ${index + 1}`}
                                            onClick={() => removeStop(index)}
                                        >
                                            <Trash2 className="text-red-500" size={18} />
                                        </Button>
                                    )}
                                </div>

                                <div className="grid gap-4 sm:grid-cols-3">
                                    <div className="space-y-2">
                                        <Label>City</Label>
                                        <Input
                                            placeholder="Milford"
                                            {...register(`stops.${index}.city`)}
                                        />
                                        <p className="text-xs text-red-600">
                                            {errors.stops?.[index]?.city?.message}
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>State</Label>
                                        <Input
                                            maxLength={2}
                                            placeholder="MA"
                                            {...register(`stops.${index}.state`)}
                                        />
                                        <p className="text-xs text-red-600">
                                            {errors.stops?.[index]?.state?.message}
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>ZIP Code</Label>
                                        <Input
                                            placeholder="01757"
                                            {...register(`stops.${index}.postalCode`)}
                                        />
                                        <p className="text-xs text-red-600">
                                            {errors.stops?.[index]?.postalCode?.message}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Vehicles */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between gap-3">
                            <CardTitle>Vehicles</CardTitle>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                    appendVehicle({ year: "", make: "", model: "" })
                                }
                            >
                                <Plus size={16} />
                                Add Vehicle
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {vehicles.map((vehicle, index) => (
                            <div
                                key={vehicle.id}
                                className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                            >
                                <div className="mb-4 flex items-center justify-between">
                                    <h3 className="font-semibold">
                                        Vehicle {index + 1}
                                    </h3>

                                    {vehicles.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            aria-label={`Remove vehicle ${index + 1}`}
                                            onClick={() => removeVehicle(index)}
                                        >
                                            <Trash2 className="text-red-500" size={18} />
                                        </Button>
                                    )}
                                </div>

                                <div className="grid gap-4 sm:grid-cols-3">
                                    <div className="space-y-2">
                                        <Label>Year</Label>
                                        <Input
                                            placeholder="2010"
                                            {...register(`vehicles.${index}.year`)}
                                        />
                                        <p className="text-xs text-red-600">
                                            {errors.vehicles?.[index]?.year?.message}
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Make</Label>
                                        <Input
                                            placeholder="Toyota"
                                            {...register(`vehicles.${index}.make`)}
                                        />
                                        <p className="text-xs text-red-600">
                                            {errors.vehicles?.[index]?.make?.message}
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Model</Label>
                                        <Input
                                            placeholder="Corolla"
                                            {...register(`vehicles.${index}.model`)}
                                        />
                                        <p className="text-xs text-red-600">
                                            {errors.vehicles?.[index]?.model?.message}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Transportation notes */}
                <Card>
                    <CardHeader>
                        <CardTitle>Transportation Instructions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Label htmlFor="notes">Release Notes</Label>
                        <Textarea
                            id="notes"
                            className="mt-2"
                            rows={4}
                            placeholder="Additional pickup or delivery instructions..."
                            {...register("transportationReleaseNotes")}
                        />
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => reset()}>
                        Clear Form
                    </Button>

                    <Button type="submit" disabled={isSubmitting}>
                        <Send size={16} />
                        Submit Request
                    </Button>
                </div>
            </form>
        </div>
    );
}
