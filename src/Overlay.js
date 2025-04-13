import Logo from "./yl.png";
import { useGLTF, useTexture } from "@react-three/drei";
import { Decal } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  AiOutlineHighlight,
  AiOutlineShopping,
  AiFillCamera,
  AiOutlineArrowLeft,
} from "react-icons/ai";
import { FaPaypal, FaCreditCard } from "react-icons/fa";
import { useSnapshot } from "valtio";
import { state } from "./store";
import { motion, AnimatePresence } from "framer-motion";
import emailjs from "emailjs-com";



export default function Overlay() {
  const snap = useSnapshot(state);
  const [cartOpen, setCartOpen] = useState(false);
  const [descriptionOpen, setDescriptionOpen] = useState(false); // New state for description pop-up
  const [formData, setFormData] = useState({
    email: "",
    streetAddress: "",
    postalCode: "",
    country: "",
    size: "M",
    quantity: 1, // Added quantity state
    image: null,
  });

  const transition = { type: "spring", duration: 0.8 };
  const config = {
    initial: { x: -100, opacity: 0, transition: { ...transition, delay: 0.5 } },
    animate: { x: 0, opacity: 1, transition: { ...transition, delay: 0 } },
    exit: { x: -100, opacity: 0, transition: { ...transition, delay: 0 } },
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setFormData({ ...formData, image: files[0] });
    } else if (name === "quantity") {
      setFormData({ ...formData, quantity: value });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSendOrder = (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append("email", formData.email);
    form.append("address", formData.streetAddress);
    form.append("postalCode", formData.postalCode);
    form.append("country", formData.country);
    form.append("quantity", formData.quantity);
    form.append("size", formData.size);
    form.append("model", snap.selectedModel);
    form.append("color", snap.selectedColor);
    form.append("image", formData.image);

    emailjs
      .sendForm("service_xaztx63", "__ejs-test-mail-service__", e.target, "1MyEdTCbuXB7LL_GW")
      .then(() => {
        alert("Order sent successfully!");
        setCartOpen(false);
      })
      .catch((error) => {
        console.error("EmailJS Error:", error);
        alert("Failed to send order. Try again.");
      });
  };

  // Calculate total price
  const pricePerItem = 59.99;
  const totalPrice = (formData.quantity * pricePerItem).toFixed(2);

  const PAYPAL_CLIENT_ID = "AdLF0obmUVJoI5oVGjqjLaP7JS9WZlGmtaSgacIVuZiRpQAQ-B8uSUDKZKy-95ooySdpfzXZcXoYwznQ";
const PAYPAL_SCRIPT_ID = "paypal-sdk-script-yverdon";

useEffect(() => {
  const loadPayPalButtons = () => {
    const container = document.getElementById("paypal-button-container");

    if (!container) {
      console.error("PayPal container not found.");
      return;
    }

    container.innerHTML = ""; // Clear any previous button

    if (window.paypal && typeof window.paypal.Buttons === "function") {
      window.paypal.Buttons({
        createOrder: (data, actions) => {
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  value: totalPrice.toString(),
                },
              },
            ],
          });
        },
        onApprove: (data, actions) => {
          return actions.order.capture().then((details) => {
            alert(`Payment successful: ${details.payer.name.given_name}`);
            handleSendOrder(data);
          });
        },
        onError: (err) => {
          console.error("PayPal Button Error:", err);
          alert("Payment failed. Please try again.");
        },
      }).render("#paypal-button-container");
    } else {
      console.error("PayPal SDK not available yet.");
    }
  };

  const addPayPalScript = () => {
    const existingScript = document.getElementById(PAYPAL_SCRIPT_ID);

    if (!existingScript) {
      const script = document.createElement("script");
      script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&components=buttons`;
      script.id = PAYPAL_SCRIPT_ID;
      script.async = true;
      script.onload = loadPayPalButtons;
      script.onerror = () => {
        console.error("Failed to load PayPal SDK script.");
        alert("Failed to load PayPal payment system. Please refresh the page.");
      };
      document.body.appendChild(script);
    } else {
      // If already loaded and PayPal is ready, render buttons
      if (window.paypal) {
        loadPayPalButtons();
      } else {
        // If SDK script is there but not yet available
        existingScript.addEventListener("load", loadPayPalButtons);
      }
    }
  };

  addPayPalScript();
}, [totalPrice]);
  

  const itemDescription = {
    sports_tee: "The recycled sports tee is perfect for any active lifestyle. Lightweight, breathable, and made from high-quality material.",
    yoga_pants: "These yoga pants offer full flexibility and comfort for any yoga session. Stretchy and supportive.",
    yoga_mat: "This yoga mat is extra cushioned for support during your poses and is perfect for all types of floor exercises.",
  };

  return (
    <div className="container">
      <motion.header
  className="header"
  initial={{ opacity: 0, y: -120 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ type: "spring", duration: 1.8, delay: 1 }}
  style={{
    display: "flex",
    justifyContent: "space-between", // Keep this for the left and right spacing
    alignItems: "center",
    padding: "1rem",
    width: "100%",
    zIndex: 10,
    position: "relative",
  }}
>
  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
    <div
      style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
      onClick={() => {
        state.intro = true;
      }}
    >
      <img src={Logo} alt="Logo" width="80" height="80" />
    </div>
    <a
      href="https://www.tiktok.com/@yogalooshop?is_from_webapp=1&sender_device=pc"
      target="_blank"
      rel="noopener noreferrer"
    >
      <img
        src="/tiktok.png"
        alt="TikTok"
        width="40"
        height="40"
        style={{ cursor: "pointer" }}
      />
    </a>
  </div>

  {/* Centered button */}
  <div
    style={{
      position: "absolute", // This makes it float in the center
      left: "50%", // Moves it to the middle
      transform: "translateX(-50%)", // Corrects the alignment to be truly centered
      top: "50%", // Optional: to center vertically, if needed
      transform: "translate(-50%, -50%)", // Ensures perfect centering
    }}
  >
    <a
      onClick={() => setDescriptionOpen(true)} // Toggles the description popup when clicked

    >
      <img
        src="note.webp"
        alt="View Item Description"
        style={{
          background: "none",
          padding: "0.2rem 0.5rem", // Adjusted padding for a smaller button
          borderRadius: "6px",
          cursor: "pointer",
          width: "50px", // Set a specific width for the image to make it smaller
          height: "50px", // Set a specific height for the image to make it smaller
        }}
      />
    </a>
  </div>

  <AiOutlineShopping
  size="2.5em"
  style={{ cursor: "pointer" }}
  onClick={() => {
    setCartOpen(true);
    // Hide the .model-buttons and the "Select Model" text when shop/cart opens
    const modelButtons = document.querySelectorAll(".model-buttons");
    const selectModelText = document.querySelector(".model-switch h4");

    modelButtons.forEach((el) => {
      // Only hide model buttons except cancel button
      if (!el.classList.contains("cancel-button")) {
        el.style.display = "none";
      }
    });

    if (selectModelText) {
      selectModelText.style.display = "none";
    }

    // Regenerate PayPal button when cart opens
    addPayPalScript(); // Ensure this function is defined in your code
    
  }}
/>
</motion.header>

      {/* Description Popup */}
      <AnimatePresence>
        {descriptionOpen && (
          <motion.div
            className="description-popup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={transition}
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "white",
              padding: "2rem",
              borderRadius: "10px",
              boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
              zIndex: 9999,
              width: "80%",
              maxWidth: "500px",
            }}
          >
            <h3>{snap.selectedModel}</h3>
            <p>{itemDescription[snap.selectedModel]}</p>
            <button
              onClick={() => setDescriptionOpen(false)}
              style={{
                background: "#e74c3c",
                color: "white",
                padding: "0.5rem 1rem",
                borderRadius: "6px",
                fontSize: "1rem",
                marginTop: "1rem",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {cartOpen && (
          <motion.form
            className="cart-modal"
            onSubmit={handleSendOrder}
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={transition}
            style={{
              position: "absolute",
              top: "100px",
              right: "20px",
              background: snap.selectedColor === "black" ? "#333333" : snap.selectedColor || "#fff",
              padding: "1.5rem",
              borderRadius: "12px",
              boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
              zIndex: 999,
              width: "300px",
              maxWidth: "95%",
              height: "auto",
            }}
          >
            {/* Cart Modal Content */}
            <div
              style={{
                maxHeight: "70vh",
                overflowY: "auto",
                padding: "1rem",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              <h3
                style={{
                  marginBottom: "0.5rem",
                  fontSize: "1.5rem",
                  textAlign: "center",
                }}
              >
                🛍️ Your Order
              </h3>
              <p style={{ fontSize: "1rem" }}>
                <strong>Item:</strong> {snap.selectedModel}
              </p>
              <p style={{ fontSize: "1rem" }}>
                <strong>Color:</strong> {snap.selectedColor}
              </p>
              <p style={{ fontSize: "1rem" }}>
                <strong>Total:</strong> ${totalPrice}
              </p>

              {/* Form Fields and PayPal */}
              {/* FORM FIELDS */}
              {[
                {
                  label: "Size",
                  name: "size",
                  type: "select",
                  options: ["S", "M", "L", "XL"],
                },
                { label: "Quantity", name: "quantity", type: "number" },
                { label: "Email", name: "email", type: "email" },
                { label: "Street Address", name: "streetAddress", type: "text" },
                { label: "Postal Code", name: "postalCode", type: "text" },
                { label: "Country", name: "country", type: "text" },
              ].map((field) => (
                <div
                  key={field.name}
                  style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}
                >
                  <label style={{ fontSize: "1rem" }}>{field.label}:</label>
                  {field.type === "select" ? (
                    <select
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleInputChange}
                      style={{
                        padding: "0.5rem",
                        borderRadius: "6px",
                        border: "1px solid #ccc",
                        fontSize: "1rem",
                        width: "100%",
                        boxSizing: "border-box",
                      }}
                    >
                      {field.options.map((opt) => (
                        <option key={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      name={field.name}
                      required
                      value={formData[field.name]}
                      onChange={handleInputChange}
                      min={field.type === "number" ? "1" : undefined}
                      style={{
                        padding: "0.5rem",
                        borderRadius: "6px",
                        border: "1px solid #ccc",
                        fontSize: "1rem",
                        width: "100%",
                        boxSizing: "border-box",
                      }}
                    />
                  )}
                </div>
              ))}

              {/* IMAGE UPLOAD */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                <label style={{ fontSize: "1rem" }}>Upload Image (Optional):</label>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleInputChange}
                  style={{
                    fontSize: "0.9rem",
                  }}
                />
              </div>

              {/* PAYPAL */}
              <div
                id="paypal-button-container"
                style={{ marginTop: "0.5rem", width: "100%" }}
              ></div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                style={{
                  padding: "0.5rem 1rem",
                  color: "white",
                  background: "#0070ba",
                  border: "none",
                  borderRadius: "6px",
                  fontWeight: "bold",
                  fontSize: "0.9rem",
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "0.5rem",
                  transition: "background 0.3s ease",
                }}
              >
                <FaPaypal /> Send Order
              </button>

              {/* CANCEL BUTTON */}
              <button
                type="button"
                className="cancel-button" // Assign a unique class to the cancel button
                onClick={() => {
                  setCartOpen(false);
                  // Show all hidden model buttons again when cancel is clicked
                  const modelButtons = document.querySelectorAll(".model-buttons");
                  const selectModelText = document.querySelector(".model-switch h4");

                  modelButtons.forEach((el) => {
                    el.style.display = "";
                  });

                  if (selectModelText) {
                    selectModelText.style.display = "";
                  }
                }}
                style={{
                  padding: "0.5rem 1rem",
                  color: "white",
                  background: "#e74c3c",
                  border: "none",
                  borderRadius: "6px",
                  fontWeight: "bold",
                  fontSize: "0.9rem",
                  width: "100%",
                  transition: "background 0.3s ease",
                }}
              >
                Cancel
        </button>
      </div>
    </motion.form>
  )}
</AnimatePresence>

<AnimatePresence>
  {snap.intro ? (
    <Intro key="main" config={config} />
  ) : (
    <Customizer key="custom" config={config} />
  )}
</AnimatePresence>
</div>
);
}

function Intro({ config }) {
  return (
    <motion.section {...config}>
      <div className="section--container">
        <div>
          <h1></h1>
        </div>
        <div className="support--content">
          <div>
            <p>
              Get ready for yoga season with our brand-new cute little 3D
              webshop. <strong>Follow the hype.</strong>
              Treat your body like a temple.
            </p>
            <button
              style={{ background: "black" }}
              onClick={() => (state.intro = false)}
            >
              pick your aura <AiOutlineHighlight size="1.3em" />
            </button>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function Customizer({ config }) {
  const snap = useSnapshot(state);

  return (
    <motion.section {...config}>
      <div className="customizer">
        <div className="model-switch">
          <h4>Select Model</h4>
          <div className="model-buttons">
            <button
              className={snap.selectedModel === "sports_tee" ? "active" : ""}
              style={{ background: snap.selectedColor === "white" ? "#ccc" : snap.selectedColor }}
              onClick={() => (state.selectedModel = "sports_tee")}
            >
              Sports tee
            </button>
            <button
              className={snap.selectedModel === "yoga_pants" ? "active" : ""}
              style={{ background: snap.selectedColor === "white" ? "#ccc" : snap.selectedColor }}
              onClick={() => (state.selectedModel = "yoga_pants")}
            >
              Yoga Pants
            </button>
            <button
              className={snap.selectedModel === "yoga_mat" ? "active" : ""}
              style={{ background: snap.selectedColor === "white" ? "#ccc" : snap.selectedColor }}
              onClick={() => (state.selectedModel = "yoga_mat")}
            >
              Yoga Mat
            </button>
          </div>
        </div>

        <div className="color-options">
          {snap.colors.map((color) => (
            <div
              key={color}
              className="circle"
              style={{ background: color }}
              onClick={() => (state.selectedColor = color)}
            ></div>
          ))}
        </div>

        <div className="decals">
          <div className="decals--container">
            {snap.decals.map((decal) => (
              <div
                key={decal}
                className="decal"
                onClick={() => (state.selectedDecal = decal)}
              >
                <img src={decal + "_thumb.png"} alt="brand" />
              </div>
            ))}
          </div>
        </div>

        <button
          className="share"
          style={{ background: snap.selectedColor === "white" ? "#ccc" : snap.selectedColor }}
          onClick={() => {
            const link = document.createElement("a");
            link.setAttribute("download", "canvas.png");
            link.setAttribute(
              "href",
              document
                .querySelector("canvas")
                .toDataURL("image/png")
                .replace("image/png", "image/octet-stream")
            );
            link.click();
          }}
        >
          DOWNLOAD
          <AiFillCamera size="1.3em" />
        </button>
      </div>
    </motion.section>
  );
}