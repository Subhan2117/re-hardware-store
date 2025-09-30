'use client';
import { useState } from 'react';

export default function uselogin() {
  const [showPassword, setShowPassword] = useState(false);

  return { showPassword, setShowPassword };
}
