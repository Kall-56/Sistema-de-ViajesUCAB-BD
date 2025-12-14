"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, EyeOff, Plane, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function LoginRegisterForm() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Register form state
  const [registerNombre1, setRegisterNombre1] = useState("");
  const [registerNombre2, setRegisterNombre2] = useState("");
  const [registerApellido1, setRegisterApellido1] = useState("");
  const [registerApellido2, setRegisterApellido2] = useState("");
  const [registerCI, setRegisterCI] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");
  const [registerDireccion, setRegisterDireccion] = useState("");
  const [registerEstadoCivil, setRegisterEstadoCivil] = useState("");
  const [registerBirthdate, setRegisterBirthdate] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);

  // Password validation
  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasNumber = /\d/.test(password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return {
      minLength,
      hasNumber,
      hasSymbol,
      isValid: minLength && hasNumber && hasSymbol,
    };
  };

  const passwordValidation = validatePassword(registerPassword);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginEmail, loginPassword }),
      });

      const data = await res.json();

      console.log("🟢 Login response:", data);

      if (!res.ok) {
        alert(data.error ?? "Credenciales inválidas");
        return;
      }

      const rolId = data.user.rolId;

      if (rolId === 3) router.push("/admin/dashboard");
      else if (rolId === 2) router.push("/proveedor/dashboard");
      else router.push("/"); // cliente al home
    } catch (err) {
      console.error("🔴 handleLogin error:", err);
      alert("Error iniciando sesión");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones de campos requeridos
    if (!registerNombre1?.trim()) {
      toast.error("Error de validación", {
        description: "El primer nombre es requerido",
      });
      return;
    }

    if (!registerApellido1?.trim()) {
      toast.error("Error de validación", {
        description: "El primer apellido es requerido",
      });
      return;
    }

    if (!registerCI?.trim()) {
      toast.error("Error de validación", {
        description: "La cédula de identidad es requerida",
      });
      return;
    }

    // Validar cédula (debe ser número positivo)
    const ciNumber = Number(registerCI.trim());
    if (!Number.isInteger(ciNumber) || ciNumber <= 0 || ciNumber.toString().length < 6) {
      toast.error("Error de validación", {
        description: "La cédula debe ser un número válido de al menos 6 dígitos",
      });
      return;
    }

    if (!registerEmail?.trim()) {
      toast.error("Error de validación", {
        description: "El correo electrónico es requerido",
      });
      return;
    }

    // Validar formato de email
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailRegex.test(registerEmail.trim())) {
      toast.error("Error de validación", {
        description: "Ingresa un correo electrónico válido",
      });
      return;
    }

    if (!registerPhone?.trim()) {
      toast.error("Error de validación", {
        description: "El teléfono es requerido",
      });
      return;
    }

    // Validar teléfono (debe tener al menos 10 dígitos)
    const phoneNumber = registerPhone.replace(/\D/g, ""); // Remover caracteres no numéricos
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error("Error de validación", {
        description: "Ingresa un número de teléfono válido (mínimo 10 dígitos)",
      });
      return;
    }

    if (!registerDireccion?.trim()) {
      toast.error("Error de validación", {
        description: "La dirección es requerida",
      });
      return;
    }

    if (registerDireccion.trim().length < 10) {
      toast.error("Error de validación", {
        description: "La dirección debe tener al menos 10 caracteres",
      });
      return;
    }

    if (!registerEstadoCivil) {
      toast.error("Error de validación", {
        description: "El estado civil es requerido",
      });
      return;
    }

    if (!registerBirthdate) {
      toast.error("Error de validación", {
        description: "La fecha de nacimiento es requerida",
      });
      return;
    }

    // Validar edad (mayor de 18)
    const fechaNac = new Date(registerBirthdate);
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mes = hoy.getMonth() - fechaNac.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }
    
    if (edad < 18) {
      toast.error("Error de validación", {
        description: "Debes ser mayor de 18 años para registrarte",
      });
      return;
    }

    // Validar que la fecha no sea futura
    if (fechaNac > hoy) {
      toast.error("Error de validación", {
        description: "La fecha de nacimiento no puede ser futura",
      });
      return;
    }

    // Validaciones de contraseña
    if (!registerPassword) {
      toast.error("Error de validación", {
        description: "La contraseña es requerida",
      });
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      toast.error("Error de validación", {
        description: "Las contraseñas no coinciden",
      });
      return;
    }
    
    if (!passwordValidation.isValid) {
      toast.error("Error de validación", {
        description: "La contraseña no cumple con los requisitos de seguridad",
      });
      return;
    }

    setRegisterLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: registerEmail.trim(),
          contraseña: registerPassword,
          nombre_1: registerNombre1.trim(),
          nombre_2: registerNombre2.trim() || null,
          apellido_1: registerApellido1.trim(),
          apellido_2: registerApellido2.trim() || null,
          c_i: ciNumber,
          telefonos: [phoneNumber], // Enviar como string, se convierte a bigint en el backend
          direccion: registerDireccion.trim(),
          estado_civil: registerEstadoCivil,
          fecha_nacimiento: registerBirthdate,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error("Error en el registro", {
          description: data.error ?? "No se pudo completar el registro",
        });
        return;
      }

      toast.success("Registro exitoso", {
        description: "Tu cuenta ha sido creada correctamente. Ahora puedes iniciar sesión.",
      });

      // Limpiar formulario
      setRegisterNombre1("");
      setRegisterNombre2("");
      setRegisterApellido1("");
      setRegisterApellido2("");
      setRegisterCI("");
      setRegisterEmail("");
      setRegisterPassword("");
      setRegisterConfirmPassword("");
      setRegisterPhone("");
      setRegisterDireccion("");
      setRegisterEstadoCivil("");
      setRegisterBirthdate("");

      // Cambiar a tab de login
      setTimeout(() => {
        const loginTab = document.querySelector('[value="login"]') as HTMLElement;
        if (loginTab) loginTab.click();
      }, 2000);
    } catch (err: any) {
      console.error("Error en registro:", err);
      toast.error("Error en el registro", {
        description: err?.message ?? "Ocurrió un error inesperado",
      });
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    console.log("Social login with:", provider);
    // Add social login logic here
  };

  return (
    <Card className="w-full shadow-xl">
      <CardHeader className="text-center space-y-2">
        <div className="flex justify-center mb-2">
          <div className="p-3 bg-blue-100 rounded-full">
            <Plane className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <CardTitle className="text-2xl md:text-3xl font-bold">
          Bienvenido a ViajesUCAB
        </CardTitle>
        <CardDescription className="md:hidden">
          Tu próxima aventura comienza aquí
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login" className="text-base">
              Iniciar Sesión
            </TabsTrigger>
            <TabsTrigger value="register" className="text-base">
              Registrarse
            </TabsTrigger>
          </TabsList>

          {/* Login Tab */}
          <TabsContent value="login" className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">
                  Correo electrónico o Usuario
                </Label>
                <Input
                  id="login-email"
                  type="text"
                  placeholder="tu@email.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) =>
                      setRememberMe(checked as boolean)
                    }
                  />
                  <label
                    htmlFor="remember"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Recordarme
                  </label>
                </div>
                <Button
                  type="button"
                  variant="link"
                  className="px-0 text-blue-600 hover:text-blue-700"
                >
                  ¿Olvidaste tu contraseña?
                </Button>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                Iniciar Sesión
              </Button>
            </form>

            <div className="relative my-6">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-gray-500">
                O continúa con
              </span>
            </div>

            {/* Social login buttons */}
            <div className="grid grid-cols-3 gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-11 bg-transparent"
                onClick={() => handleSocialLogin("google")}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-11 bg-transparent"
                onClick={() => handleSocialLogin("facebook")}
              >
                <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-11 bg-transparent"
                onClick={() => handleSocialLogin("apple")}
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
              </Button>
            </div>
          </TabsContent>

          {/* Register Tab */}
          <TabsContent value="register" className="space-y-4">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="register-nombre1">
                    Primer nombre <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="register-nombre1"
                    type="text"
                    placeholder="Juan"
                    value={registerNombre1}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
                      setRegisterNombre1(value);
                    }}
                    required
                    minLength={2}
                    maxLength={50}
                    className="h-11"
                  />
                  {registerNombre1 && registerNombre1.length < 2 && (
                    <p className="text-xs text-red-600">
                      El nombre debe tener al menos 2 caracteres
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-nombre2">Segundo nombre (opcional)</Label>
                  <Input
                    id="register-nombre2"
                    type="text"
                    placeholder="Carlos"
                    value={registerNombre2}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
                      setRegisterNombre2(value);
                    }}
                    maxLength={50}
                    className="h-11"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="register-apellido1">
                    Primer apellido <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="register-apellido1"
                    type="text"
                    placeholder="Pérez"
                    value={registerApellido1}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
                      setRegisterApellido1(value);
                    }}
                    required
                    minLength={2}
                    maxLength={50}
                    className="h-11"
                  />
                  {registerApellido1 && registerApellido1.length < 2 && (
                    <p className="text-xs text-red-600">
                      El apellido debe tener al menos 2 caracteres
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-apellido2">Segundo apellido (opcional)</Label>
                  <Input
                    id="register-apellido2"
                    type="text"
                    placeholder="González"
                    value={registerApellido2}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
                      setRegisterApellido2(value);
                    }}
                    maxLength={50}
                    className="h-11"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="register-ci">
                    Cédula de identidad <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="register-ci"
                    type="text"
                    placeholder="12345678"
                    value={registerCI}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      if (value.length <= 10) {
                        setRegisterCI(value);
                      }
                    }}
                    required
                    className="h-11"
                    minLength={6}
                    maxLength={10}
                  />
                  {registerCI && (registerCI.length < 6 || registerCI.length > 10) && (
                    <p className="text-xs text-red-600">
                      La cédula debe tener entre 6 y 10 dígitos
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-phone">
                    Teléfono <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="register-phone"
                    type="text"
                    placeholder="04121234567"
                    value={registerPhone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      if (value.length <= 15) {
                        setRegisterPhone(value);
                      }
                    }}
                    required
                    className="h-11"
                    minLength={10}
                    maxLength={15}
                  />
                  {registerPhone && registerPhone.length < 10 && (
                    <p className="text-xs text-red-600">
                      El teléfono debe tener al menos 10 dígitos
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-email">
                  Correo electrónico <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="tu@email.com"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value.toLowerCase().trim())}
                  required
                  className="h-11"
                  maxLength={100}
                />
                {registerEmail && !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z]{2,}$/i.test(registerEmail) && (
                  <p className="text-xs text-red-600">
                    Ingresa un correo electrónico válido
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-direccion">
                  Dirección <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="register-direccion"
                  type="text"
                  placeholder="Calle, número, ciudad"
                  value={registerDireccion}
                  onChange={(e) => setRegisterDireccion(e.target.value)}
                  required
                  className="h-11"
                  minLength={10}
                  maxLength={200}
                />
                {registerDireccion && registerDireccion.length < 10 && (
                  <p className="text-xs text-red-600">
                    La dirección debe tener al menos 10 caracteres
                  </p>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="register-estado-civil">
                    Estado civil <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={registerEstadoCivil}
                    onValueChange={setRegisterEstadoCivil}
                    required
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Selecciona tu estado civil" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="soltero">Soltero/a</SelectItem>
                      <SelectItem value="casado">Casado/a</SelectItem>
                      <SelectItem value="divorciado">Divorciado/a</SelectItem>
                      <SelectItem value="viudo">Viudo/a</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-birthdate">
                    Fecha de nacimiento <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="register-birthdate"
                    type="date"
                    value={registerBirthdate}
                    onChange={(e) => setRegisterBirthdate(e.target.value)}
                    required
                    className="h-11"
                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split("T")[0]}
                    min={new Date(new Date().setFullYear(new Date().getFullYear() - 120)).toISOString().split("T")[0]}
                  />
                  <p className="text-xs text-muted-foreground">
                    Debes ser mayor de 18 años
                  </p>
                  {registerBirthdate && (() => {
                    const fechaNac = new Date(registerBirthdate);
                    const hoy = new Date();
                    let edad = hoy.getFullYear() - fechaNac.getFullYear();
                    const mes = hoy.getMonth() - fechaNac.getMonth();
                    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
                      edad--;
                    }
                    if (edad < 18) {
                      return (
                        <p className="text-xs text-red-600">
                          Debes ser mayor de 18 años para registrarte
                        </p>
                      );
                    }
                    if (fechaNac > hoy) {
                      return (
                        <p className="text-xs text-red-600">
                          La fecha de nacimiento no puede ser futura
                        </p>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="register-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    required
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {registerPassword && (
                  <div className="text-xs space-y-1 mt-2">
                    <p
                      className={
                        passwordValidation.minLength
                          ? "text-green-600"
                          : "text-gray-500"
                      }
                    >
                      {passwordValidation.minLength ? "✓" : "○"} Mínimo 8
                      caracteres
                    </p>
                    <p
                      className={
                        passwordValidation.hasNumber
                          ? "text-green-600"
                          : "text-gray-500"
                      }
                    >
                      {passwordValidation.hasNumber ? "✓" : "○"} Incluye al
                      menos un número
                    </p>
                    <p
                      className={
                        passwordValidation.hasSymbol
                          ? "text-green-600"
                          : "text-gray-500"
                      }
                    >
                      {passwordValidation.hasSymbol ? "✓" : "○"} Incluye al
                      menos un símbolo (!@#$%^&*)
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-confirm-password">
                  Confirmar contraseña
                </Label>
                <div className="relative">
                  <Input
                    id="register-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={registerConfirmPassword}
                    onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                    required
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {registerConfirmPassword &&
                  registerPassword !== registerConfirmPassword && (
                    <p className="text-xs text-red-600">
                      Las contraseñas no coinciden
                    </p>
                  )}
              </div>

              <p className="text-xs text-muted-foreground">
                Al registrarte, aceptas nuestra{" "}
                <Button
                  type="button"
                  variant="link"
                  className="h-auto p-0 text-xs text-blue-600"
                >
                  Política de Privacidad
                </Button>
                . Protegemos tus datos conforme a las normativas vigentes.
              </p>

              <Button
                type="submit"
                className="w-full h-11 bg-orange-600 hover:bg-orange-700 text-white font-semibold"
                disabled={registerLoading}
              >
                {registerLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando cuenta...
                  </>
                ) : (
                  "Crear cuenta"
                )}
              </Button>
            </form>

            <div className="relative my-6">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-gray-500">
                O regístrate con
              </span>
            </div>

            {/* Social register buttons */}
            <div className="grid grid-cols-3 gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-11 bg-transparent"
                onClick={() => handleSocialLogin("google")}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-11 bg-transparent"
                onClick={() => handleSocialLogin("facebook")}
              >
                <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-11 bg-transparent"
                onClick={() => handleSocialLogin("apple")}
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
