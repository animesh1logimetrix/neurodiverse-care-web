import { useEffect, useState, useRef } from "react";
import Input from "../../form/input/InputField";
import Select from "../../form/Select";
import Switch from "../../form/switch/Switch";
import DatePicker from "../../form/date-picker";

export type FieldConfig = {
  name: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'select' | 'toggle' | 'date';
  options?: { label: string; value: string }[]; // Used if type is 'select'
  colSpan?: 1 | 2;    // Default 1. Use 2 to span full width in a 2-col grid
  required?: boolean;
  placeholder?: string;
  condition?: (formData: Record<string, any>) => boolean; // For dynamic form dependencies
};

export interface CustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  fields: FieldConfig[];
  onSubmit: (formData: Record<string, any>) => Promise<void> | void;
  submitText?: string;
  cancelText?: string;
  className?: string;
}

export const CustomModal: React.FC<CustomModalProps> = ({
  isOpen,
  onClose,
  title,
  fields,
  onSubmit,
  submitText = 'Submit',
  cancelText = 'Cancel',
  className = 'max-w-[700px]',
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Reset form data when modal opens
  useEffect(() => {
    if (isOpen) {
      const initialData: Record<string, any> = {};
      fields.forEach((field) => {
        initialData[field.name] = field.type === 'toggle' ? false : '';
      });
      setFormData(initialData);
      setIsSubmitting(false);
    }
  }, [isOpen, fields]);

  // Modal Escape Key and Overflow
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 h-full w-full bg-gray-900/40 dark:bg-gray-900/80 transition-opacity" onClick={onClose}></div>
      
      {/* Modal Content */}
      <div
        ref={modalRef}
        className={`relative w-full rounded-3xl bg-white dark:bg-gray-900 shadow-xl ${className} p-0 m-4`}
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit} className="flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-[1.125rem] font-semibold text-gray-800 dark:text-white/90">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 transition-colors hover:text-gray-700 dark:hover:text-gray-300"
              aria-label="Close"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="p-8 overflow-y-auto">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {fields.map((field) => {
                // Handle field dependencies
                if (field.condition && !field.condition(formData)) return null;

                const spanClass = field.colSpan === 2 ? 'md:col-span-2' : 'md:col-span-1';

                return (
                  <div key={field.name} className={`${spanClass} flex flex-col gap-1.5`}>
                    {field.type !== 'toggle' && (
                      <label className="block text-sm font-semibold text-gray-800 dark:text-gray-300">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </label>
                    )}

                    {(field.type === 'text' || field.type === 'email' || field.type === 'number') && (
                      <Input
                        type={field.type}
                        placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                        value={formData[field.name] || ''}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                      />
                    )}

                    {field.type === 'date' && (
                      <DatePicker
                        id={`date-${field.name}`}
                        placeholder={field.placeholder || `Select ${field.label.toLowerCase()}`}
                        onChange={([date]) => handleChange(field.name, date)}
                      />
                    )}

                    {field.type === 'select' && (
                      <Select
                        options={field.options || []}
                        placeholder={field.placeholder || `Select ${field.label.toLowerCase()}`}
                        onChange={(val) => handleChange(field.name, val)}
                        defaultValue={formData[field.name] || ''}
                      />
                    )}

                    {field.type === 'toggle' && (
                      <div className="mt-2">
                        <Switch
                          label={field.label}
                          defaultChecked={!!formData[field.name]}
                          onChange={(checked) => handleChange(field.name, checked)}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end px-8 py-5 space-x-4 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition-colors text-sm disabled:opacity-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              {cancelText}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-lg bg-brand-500 text-white font-semibold hover:bg-brand-600 transition-colors text-sm disabled:opacity-50 flex items-center justify-center min-w-[100px]"
            >
              {isSubmitting ? 'Submitting...' : submitText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
