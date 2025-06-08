import { useState, useCallback } from 'react';

type ValidationRule<T> = (value: T) => string | undefined;

interface ValidationRules<T> {
  [key: string]: ValidationRule<T>;
}

interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
}

export function useForm<T extends Record<string, any>>(
  initialValues: T,
  validationRules?: ValidationRules<T>,
  onSubmit?: (values: T) => Promise<void> | void
) {
  const [state, setState] = useState<FormState<T>>({
    values: initialValues,
    errors: {},
    touched: {},
    isSubmitting: false,
  });

  const validateField = useCallback(
    (name: keyof T, value: T[keyof T]) => {
      if (!validationRules || !validationRules[name as string]) return undefined;

      const rule = validationRules[name as string];
      return rule(value);
    },
    [validationRules]
  );

  const validateForm = useCallback(() => {
    const errors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    Object.keys(state.values).forEach((key) => {
      const error = validateField(key as keyof T, state.values[key as keyof T]);
      if (error) {
        errors[key as keyof T] = error;
        isValid = false;
      }
    });

    setState((prev) => ({ ...prev, errors }));
    return isValid;
  }, [state.values, validateField]);

  const handleChange = useCallback(
    (name: keyof T, value: T[keyof T]) => {
      setState((prev) => ({
        ...prev,
        values: { ...prev.values, [name]: value },
        errors: { ...prev.errors, [name]: validateField(name, value) },
        touched: { ...prev.touched, [name]: true },
      }));
    },
    [validateField]
  );

  const handleBlur = useCallback((name: keyof T) => {
    setState((prev) => ({
      ...prev,
      touched: { ...prev.touched, [name]: true },
    }));
  }, []);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }

      const isValid = validateForm();
      if (!isValid || !onSubmit) return;

      setState((prev) => ({ ...prev, isSubmitting: true }));

      try {
        await onSubmit(state.values);
        setState((prev) => ({ ...prev, isSubmitting: false }));
      } catch (error) {
        setState((prev) => ({ ...prev, isSubmitting: false }));
        throw error;
      }
    },
    [state.values, validateForm, onSubmit]
  );

  const resetForm = useCallback(() => {
    setState({
      values: initialValues,
      errors: {},
      touched: {},
      isSubmitting: false,
    });
  }, [initialValues]);

  const setFieldValue = useCallback(
    (name: keyof T, value: T[keyof T]) => {
      handleChange(name, value);
    },
    [handleChange]
  );

  const setFieldError = useCallback((name: keyof T, error: string) => {
    setState((prev) => ({
      ...prev,
      errors: { ...prev.errors, [name]: error },
    }));
  }, []);

  return {
    values: state.values,
    errors: state.errors,
    touched: state.touched,
    isSubmitting: state.isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFieldValue,
    setFieldError,
    validateForm,
  };
} 