import React, { useState } from "react";

const renderField = (field, value, onChange, path = "") => {
  const fullPath = path ? `${path}.${field.name}` : field.name;

  if (field.type === "text" || field.type === "number") {
    return (
      <div className="mb-4" key={fullPath}>
        <label className="block mb-1">{field.label}</label>
        <input
          type={field.type}
          name={fullPath}
          value={value || ""}
          required={field.required}
          onChange={onChange}
          className="border p-2 w-full rounded"
        />
      </div>
    );
  }

  if (field.type === "radio") {
    return (
      <div className="mb-4" key={fullPath}>
        <label className="block mb-1">{field.label}</label>
        {field.options.map((option) => (
          <label key={option} className="mr-2">
            <input
              type="radio"
              name={fullPath}
              value={option}
              checked={value === option}
              required={field.required}
              onChange={onChange}
            />
            {option}
          </label>
        ))}
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <div className="mb-4" key={fullPath}>
        <label className="block mb-1">{field.label}</label>
        <select
          name={fullPath}
          value={value || ""}
          required={field.required}
          onChange={onChange}
          className="border p-2 w-full rounded"
        >
          <option value="">Select</option>
          {field.options.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>
    );
  }

  if (field.type === "checkbox") {
    return (
      <div className="mb-4" key={fullPath}>
        <label>
          <input
            type="checkbox"
            name={fullPath}
            checked={value || false}
            onChange={onChange}
          />
          {" " + field.label}
        </label>
      </div>
    );
  }

  if (field.type === "repeatable") {
    return (
      <div className="mb-4" key={fullPath}>
        <label className="block mb-2 font-semibold">{field.label}</label>
        {(value || []).map((entry, index) => (
          <div className="border p-4 rounded mb-2" key={index}>
            {field.fields.map((subField) =>
              renderField(
                subField,
                entry[subField.name],
                (e) => {
                  const newValue = [...value];
                  newValue[index][subField.name] =
                    subField.type === "checkbox"
                      ? e.target.checked
                      : e.target.value;
                  onChange({
                    target: {
                      name: fullPath,
                      value: newValue,
                    },
                  });
                },
                `${fullPath}[${index}]`
              )
            )}
          </div>
        ))}
        <button
          type="button"
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => {
            const newValue = [...(value || []), {}];
            onChange({ target: { name: fullPath, value: newValue } });
          }}
        >
          + Add {field.label}
        </button>
      </div>
    );
  }

  return null;
};

const renderPreview = (data) => {
  return (
    <div className="space-y-2 text-sm">
      {Object.entries(data).map(([key, value]) => (
        <div key={key}>
          <strong>{key}:</strong>{" "}
          {Array.isArray(value)
            ? JSON.stringify(value)
            : typeof value === "object"
            ? JSON.stringify(value)
            : value?.toString()}
        </div>
      ))}
    </div>
  );
};

const DynamicFormWizard = ({ schema }) => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({});
  const isReviewStep = step === schema.length;

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    const keys = name.split(/\.(?![^[]*\])/); // Ignore dots in brackets
    let newData = { ...formData };
    let ref = newData;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i].replace(/\[\d+\]/g, "");
      if (!ref[key]) ref[key] = {};
      ref = ref[key];
    }

    const lastKey = keys[keys.length - 1].replace(/\[\d+\]/g, "");
    ref[lastKey] = type === "checkbox" ? checked : value;
    setFormData(newData);
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch("http://localhost:4000/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (response.ok) {
        alert("Form submitted successfully!");
      } else {
        alert("Error: " + result.message);
      }
    } catch (err) {
      console.error("Submit error:", err);
      alert("Failed to submit form.");
    }
  };

  const goNext = () => {
    const currentSection = schema[step];
    const missing = currentSection.fields.filter(
      (f) => f.required && !formData[f.name]
    );
    if (missing.length > 0) {
      alert("Please fill all required fields.");
      return;
    }
    setStep(step + 1);
  };

  const goBack = () => setStep(step - 1);

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">
        {isReviewStep ? "Review & Confirm" : schema[step].title}
      </h2>

      {isReviewStep ? (
        renderPreview(formData)
      ) : (
        schema[step].fields.map((field) =>
          renderField(field, formData[field.name], handleChange)
        )
      )}

      <div className="flex justify-between mt-6">
        {step > 0 && (
          <button
            onClick={goBack}
            className="bg-gray-400 text-white px-4 py-2 rounded"
          >
            Previous
          </button>
        )}

        {isReviewStep ? (
          <button
            onClick={handleSubmit}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Confirm & Submit
          </button>
        ) : (
          <button
            onClick={goNext}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Next
          </button>
        )}
      </div>

      <div className="text-sm text-gray-500 mt-2 text-right">
        Step {step + 1} of {schema.length + 1}
      </div>
    </div>
  );
};

export default DynamicFormWizard;
