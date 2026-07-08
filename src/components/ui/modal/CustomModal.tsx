import { useEffect, useState, useRef, ReactNode } from "react";
import Switch from "../../form/switch/Switch";
import DatePicker from "../../form/date-picker";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type FieldType =
  | "text"
  | "number"
  | "email"
  | "password"
  | "select"
  | "toggle"
  | "date"
  | "textarea";

export type SelectOption = { label: string; value: string };

export type FieldConfig = {
  /** Unique key for the field — used as the formData key */
  name: string;
  /** Human-readable label shown above the input */
  label: string;
  /** Input type */
  type: FieldType;
  /** Options array — required when type is 'select' */
  options?: SelectOption[];
  /**
   * Column span inside the 2-column grid.
   * 1 = half width, 2 = full width (default: 1)
   */
  colSpan?: 1 | 2;
  /** Marks the field as required and shows an asterisk */
  required?: boolean;
  /** Placeholder text shown inside the input */
  placeholder?: string;
  /** Disable the field */
  disabled?: boolean;
  /** Additional hint text shown below the field */
  hint?: string;
  /**
   * Conditional visibility. The field is only rendered when this
   * function returns true.
   * @param formData current form values
   */
  condition?: (formData: Record<string, any>) => boolean;
};

export type ModalSize = "sm" | "md" | "lg" | "xl";
export type FooterAlign = "left" | "center" | "right";
export type AsteriskColor = "red" | "black";

// ---------------------------------------------------------------------------
// Size presets
// ---------------------------------------------------------------------------

const SIZE_CLASS: Record<ModalSize, string> = {
  sm: "max-w-[480px]",
  md: "max-w-[600px]",
  lg: "max-w-[720px]",
  xl: "max-w-[900px]",
};

const FOOTER_JUSTIFY: Record<FooterAlign, string> = {
  left: "justify-start",
  center: "justify-center",
  right: "justify-end",
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface CustomModalProps {
  // ── Visibility ──────────────────────────────────────────────────────
  /** Controls modal visibility */
  isOpen: boolean;
  /** Called when the modal should close */
  onClose: () => void;

  // ── Content ─────────────────────────────────────────────────────────
  /** Modal heading */
  title: string;
  /** Optional subtitle rendered below the title in the header */
  subtitle?: string;
  /** Ordered list of field definitions (optional – uses auto form renderer) */
  fields?: FieldConfig[];
  /** Called with the collected form values on submit (optional) */
  onSubmit?: (formData: Record<string, any>) => Promise<void> | void;
  /** Fully dynamic body content — renders any ReactNode */
  children?: ReactNode;
  /** Blue informational alert rendered below the fields / children */
  infoAlert?: ReactNode;
  /** Extra content at the bottom of the body, below the info alert */
  bodyFooter?: ReactNode;
  /** Completely replaces the default Cancel / Submit footer */
  customFooter?: ReactNode;

  // ── Text overrides ───────────────────────────────────────────────────
  /** Label for the primary (submit) button. Default: "Submit" */
  submitText?: string;
  /** Label for the cancel button. Default: "Cancel" */
  cancelText?: string;
  /** Text shown while submitting. Default: "Submitting..." */
  submittingText?: string;

  // ── Sizing & layout ─────────────────────────────────────────────────
  /** Preset size. Overridden by `maxWidth`. Default: "lg" */
  size?: ModalSize;
  /** Custom max-width Tailwind class, e.g. "max-w-[760px]" */
  maxWidth?: string;
  /** Custom max-height for the body scroll area. Default: "70vh" */
  maxBodyHeight?: string;
  /** Alignment of footer buttons. Default: "center" */
  footerAlign?: FooterAlign;
  /** Body padding. Default: "px-8 py-6" */
  padding?: string;

  // ── Style toggles ───────────────────────────────────────────────────
  /** Color of the required-field asterisk (*). Default: "black" */
  asteriskColor?: AsteriskColor;
  /** Apply backdrop blur to the overlay. Default: false */
  overlayBlur?: boolean;
  /** Hide the X close button. Default: false */
  hideCloseButton?: boolean;
  /** Show close icon. Default: true */
  showCloseIcon?: boolean;
  /** Backdrop closes modal on click. Default: true */
  closeOnBackdropClick?: boolean;
  /** Show overlay. Default: true */
  showOverlay?: boolean;
  /** Show a loading spinner / disable footer buttons. Default: false */
  isLoading?: boolean;

  // ── Pre-populate ──────────────────────────────────────────────────────
  /** Pre-populate fields with existing values. Key = field.name */
  initialValues?: Record<string, any>;

  // ── Class overrides ─────────────────────────────────────────────────
  /** Extra classes on the outer modal wrapper */
  modalClassName?: string;
  /** Extra classes applied to the overlay/backdrop */
  overlayClassName?: string;
  /** Extra classes for the header container */
  headerClassName?: string;
  /** Extra classes for the body container */
  bodyClassName?: string;
  /** Extra classes for the footer container */
  footerClassName?: string;

  // ── Button class overrides ───────────────────────────────────────────
  submitButtonClassName?: string;
  cancelButtonClassName?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildInitialData(
  fields?: FieldConfig[],
  initialValues?: Record<string, any>
): Record<string, any> {
  const data: Record<string, any> = {};
  if (!fields) return data;
  fields.forEach((f) => {
    if (initialValues && initialValues[f.name] !== undefined) {
      data[f.name] = initialValues[f.name];
    } else {
      data[f.name] = f.type === "toggle" ? false : "";
    }
  });
  return data;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const CustomModal: React.FC<CustomModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  fields,
  onSubmit,
  children,
  submitText = "Submit",
  cancelText = "Cancel",
  submittingText = "Submitting...",
  size = "lg",
  maxWidth,
  maxBodyHeight = "70vh",
  footerAlign = "center",
  asteriskColor = "black",
  overlayBlur = false,
  hideCloseButton = false,
  showCloseIcon = true,
  closeOnBackdropClick = true,
  showOverlay = true,
  isLoading = false,
  infoAlert,
  bodyFooter,
  customFooter,
  padding = "px-8 py-6",
  initialValues,
  modalClassName = "",
  overlayClassName = "",
  headerClassName = "",
  bodyClassName = "",
  footerClassName = "",
  submitButtonClassName,
  cancelButtonClassName,
}) => {
  const [formData, setFormData] = useState<Record<string, any>>(() =>
    buildInitialData(fields, initialValues)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Re-initialise whenever the modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData(buildInitialData(fields, initialValues));
      setIsSubmitting(false);
    }
  }, [isOpen, fields]);

  // Escape key + body scroll lock
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSubmit) return;
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      console.error("[CustomModal] submit error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Derived classes
  const widthClass = maxWidth ?? SIZE_CLASS[size];
  const backdropClass = overlayBlur ? "backdrop-blur-sm" : "";
  const asteriskClass = asteriskColor === "red" ? "text-red-500" : "text-black";
  const busy = isSubmitting || isLoading;
  const resolvedBodyMaxHeight =
    maxBodyHeight && maxBodyHeight !== "none"
      ? maxBodyHeight
      : "min(70vh, calc(100vh - 2rem))";

  const defaultSubmitClass =
    "px-6 py-2.5 rounded-lg bg-brand-500 text-white font-semibold hover:bg-brand-600 transition-colors text-sm disabled:opacity-50 min-w-[120px] flex items-center justify-center cursor-pointer";
  const defaultCancelClass =
    "px-6 py-2.5 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors text-sm disabled:opacity-50 cursor-pointer";

  // ── Sub-renderers ─────────────────────────────────────────────────────────

  const renderHeader = () => (
    <div
      className={`flex items-start justify-between px-8 py-5 border-b border-gray-100 ${headerClassName}`}
    >
      <div className="flex flex-col gap-0.5">
        <h2
          id="custom-modal-title"
          className="text-[1.125rem] font-bold text-gray-900 leading-snug"
        >
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs text-gray-500 font-normal">{subtitle}</p>
        )}
      </div>
      {!hideCloseButton && showCloseIcon && (
        <button
          type="button"
          onClick={onClose}
          className="ml-4 mt-0.5 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer shrink-0"
          aria-label="Close modal"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );

  const renderAutoFields = () => {
    if (!fields || fields.length === 0) return null;
    return (
      <div className="grid grid-cols-2 gap-x-6 gap-y-5 mb-5">
        {fields.map((field) => {
          if (field.condition && !field.condition(formData)) return null;

          const spanClass =
            field.colSpan === 2 ? "col-span-2" : "col-span-2 sm:col-span-1";

          return (
            <div
              key={field.name}
              className={`${spanClass} flex flex-col gap-1.5`}
            >
              {field.type !== "toggle" && (
                <label className="block text-xs font-bold text-black">
                  {field.label}{" "}
                  {field.required && (
                    <span className={asteriskClass}>*</span>
                  )}
                </label>
              )}

              {(field.type === "text" ||
                field.type === "email" ||
                field.type === "number" ||
                field.type === "password") && (
                <input
                  type={field.type}
                  required={field.required}
                  disabled={field.disabled}
                  placeholder={
                    field.placeholder ?? `Enter ${field.label.toLowerCase()}`
                  }
                  value={formData[field.name] ?? ""}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              )}

              {field.type === "textarea" && (
                <textarea
                  required={field.required}
                  disabled={field.disabled}
                  placeholder={
                    field.placeholder ?? `Enter ${field.label.toLowerCase()}`
                  }
                  value={formData[field.name] ?? ""}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
              )}

              {field.type === "select" && (
                <div className="relative">
                  <select
                    required={field.required}
                    disabled={field.disabled}
                    value={formData[field.name] ?? ""}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-10 text-sm text-gray-900 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="" disabled>
                      {field.placeholder ?? `Select ${field.label.toLowerCase()}`}
                    </option>
                    {(field.options ?? []).map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </span>
                </div>
              )}

              {field.type === "date" && (
                <DatePicker
                  id={`date-${field.name}`}
                  placeholder={
                    field.placeholder ?? `Select ${field.label.toLowerCase()}`
                  }
                  onChange={([date]) => handleChange(field.name, date)}
                />
              )}

              {field.type === "toggle" && (
                <Switch
                  label={field.label}
                  defaultChecked={!!formData[field.name]}
                  onChange={(checked) => handleChange(field.name, checked)}
                />
              )}

              {field.hint && (
                <p className="text-xs text-gray-500 mt-0.5">{field.hint}</p>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderBody = () => (
    <div
      className={`overflow-y-auto ${padding} ${bodyClassName}`}
      style={{ maxHeight: resolvedBodyMaxHeight }}
    >
      {renderAutoFields()}
      {children}
      {infoAlert && (
        <div className="w-full bg-[#eff6ff] rounded-lg px-4 py-3 border border-[#bfdbfe] mt-1">
          {typeof infoAlert === "string" ? (
            <p className="text-center text-xs font-semibold text-black">
              {infoAlert}
            </p>
          ) : (
            infoAlert
          )}
        </div>
      )}
      {bodyFooter}
    </div>
  );

  const renderFooter = () => {
    if (customFooter) return customFooter;
    return (
      <div
        className={`flex ${FOOTER_JUSTIFY[footerAlign]} items-center gap-3 px-8 py-5 border-t border-gray-100 ${footerClassName}`}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={busy}
          className={cancelButtonClassName ?? defaultCancelClass}
        >
          {cancelText}
        </button>
        <button
          type="submit"
          disabled={busy}
          className={submitButtonClassName ?? defaultSubmitClass}
        >
          {busy ? submittingText : submitText}
        </button>
      </div>
    );
  };

  // ── Root render ───────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-[99999] overflow-y-auto">
      {showOverlay && (
        <div
          className={`fixed inset-0 bg-gray-900/50 transition-opacity duration-300 ${backdropClass} ${overlayClassName}`}
          onClick={closeOnBackdropClick ? onClose : undefined}
        />
      )}

      <div className="flex min-h-full items-center justify-center p-4">
        <div
          ref={modalRef}
          className={`relative z-10 w-full ${widthClass} max-h-[calc(100vh-2rem)] rounded-2xl bg-white shadow-2xl m-4 flex flex-col overflow-hidden ${modalClassName}`}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="custom-modal-title"
        >
        {onSubmit ? (
          <form onSubmit={handleSubmit} className="flex flex-col min-h-0">
            {renderHeader()}
            {renderBody()}
            {renderFooter()}
          </form>
        ) : (
          <div className="flex flex-col min-h-0">
            {renderHeader()}
            {renderBody()}
            {renderFooter()}
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default CustomModal;
