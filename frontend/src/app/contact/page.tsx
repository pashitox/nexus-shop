"use client";

import { useState } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      // 👇 aquí podrías conectar con Resend o tu backend
      console.log("📨 Datos enviados:", formData);

      setStatus("success");
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      console.error("❌ Error enviando el formulario:", error);
      setStatus("error");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-6">
      <section className="max-w-lg w-full bg-white shadow-lg rounded-2xl p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">Contáctanos</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Tu nombre"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Tu correo"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg"
            required
          />

          <textarea
            name="message"
            placeholder="Tu mensaje"
            value={formData.message}
            onChange={handleChange}
            rows={4}
            className="w-full p-3 border rounded-lg"
            required
          />

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full bg-blue-600 text-white font-medium py-3 rounded-lg hover:bg-blue-700 transition"
          >
            {status === "loading" ? "Enviando..." : "Enviar"}
          </button>

          {status === "success" && (
            <p className="text-green-600 text-sm mt-2">
              ✅ Mensaje enviado correctamente.
            </p>
          )}
          {status === "error" && (
            <p className="text-red-600 text-sm mt-2">
              ❌ Ocurrió un error, inténtalo de nuevo.
            </p>
          )}
        </form>
      </section>
    </div>
  );
}
