"use client";

import { useState, forwardRef, useImperativeHandle } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { apiService, Student } from "@/lib/api-service";

export const RegistrationForm = forwardRef((props, ref) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Student>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    hasLicense: false,
    licenseNumber: "",
    preferredTransmission: "automatic",
  });

  useImperativeHandle(ref, () => ({
    handleChatbotUpdate: (fields: Partial<Student>) => {
      setFormData((prev) => ({ ...prev, ...fields }));
    },
  }));

  const updateFormData = (field: keyof Student, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]:
        field === "preferredTransmission"
          ? (value as "automatic" | "manual")
          : value,
    }));
  };

  const isFormValid = () => {
    return (
      formData.firstName.trim() !== "" &&
      formData.lastName.trim() !== "" &&
      formData.email !== "" &&
      formData.phone !== "" &&
      formData.dateOfBirth !== "" &&
      formData.address.trim() !== "" &&
      (!formData.hasLicense ||
        (formData.hasLicense && formData.licenseNumber?.trim() !== ""))
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await apiService.submitRegistration(formData);
      alert("Registration completed successfully!");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.";
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6 shadow-lg border-2">
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-primary">
          Student Registration
        </h2>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => updateFormData("firstName", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => updateFormData("lastName", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => updateFormData("email", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => updateFormData("phone", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth</Label>
            <Input
              id="dob"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => updateFormData("dateOfBirth", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => updateFormData("address", e.target.value)}
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasLicense"
              checked={formData.hasLicense}
              onCheckedChange={(checked) =>
                updateFormData("hasLicense", checked === true)
              }
            />
            <Label htmlFor="hasLicense">Do you have a driving license?</Label>
          </div>

          {formData.hasLicense && (
            <div className="space-y-2">
              <Label htmlFor="licenseNumber">License Number</Label>
              <Input
                id="licenseNumber"
                value={formData.licenseNumber}
                onChange={(e) =>
                  updateFormData("licenseNumber", e.target.value)
                }
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="preferredTransmission">
              Preferred Transmission
            </Label>
            <select
              id="preferredTransmission"
              value={formData.preferredTransmission}
              onChange={(e) =>
                updateFormData("preferredTransmission", e.target.value)
              }
              className="w-full p-2 border rounded"
            >
              <option value="automatic">Automatic</option>
              <option value="manual">Manual</option>
            </select>
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!isFormValid() || isSubmitting}
          className="w-full bg-primary hover:bg-primary/90"
        >
          {isSubmitting ? "Submitting..." : "Register"}
        </Button>
      </div>
    </Card>
  );
});

RegistrationForm.displayName = "RegistrationForm";
