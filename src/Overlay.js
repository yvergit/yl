import Logo from "./yl.png";
import { useSnapshot } from "valtio";
import { state } from "./store";
import { motion, AnimatePresence } from "framer-motion";
import {
  AiOutlineHighlight,
  AiOutlineShopping,
  AiFillCamera,
} from "react-icons/ai";
import React, { useState, useEffect, useRef } from "react";
import emailjs from "emailjs-com";

export default function Overlay() {
  const snap = useSnapshot(state);
  const [cartOpen, setCartOpen] = useState(false);
  const [descriptionOpen, setDescriptionOpen] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    streetAddress: "",
    postalCode: "",
    country: "",
    size: "M",
    quantity: 1,
    image: null,
  });

  const formDataRef = useRef(formData);
  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

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
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Calculate total price
  const pricePerItem =
    snap.selectedModel === "yoga_mat" ? 99.99 : 49.99;
  const totalPrice = (formData.quantity * pricePerItem).toFixed(2);

  // ✅ Combined Send + Pay Logic
  const handleSendAndPay = (e) => {
    e.preventDefault();

    const templateParams = {
      email: formData.email,
      streetAddress: formData.streetAddress,
      postalCode: formData.postalCode,
      country: formData.country,
      size: formData.size,
      quantity: formData.quantity,
      totalPrice: totalPrice,
      model: snap.selectedModel,
      color: snap.selectedColor,
    };

    // 1️⃣ Send email first
    emailjs
      .send("service_xaztx63", "template_ec0w1e5", templateParams, "1MyEdTCbuXB7LL_GW")
      .then(() => {
        // 2️⃣ Redirect to PayPal after success
        const base = "https://www.paypal.me/yogaloo";
        const note = `Email: ${formData.email}, Address: ${formData.streetAddress}, ${formData.postalCode}, ${formData.country}, Model: ${snap.selectedModel}, Size: ${formData.size}, Qty: ${formData.quantity}`;
        const paypalLink = `${base}/${totalPrice}?note=${encodeURIComponent(note)}`;

        window.open(paypalLink, "_blank");
      })
      .catch(() => alert("❌ Failed to send order. Try again."));
  };

  const itemDescription = {
    sports_tee: (
      <>
        <p>The recycled sports tee is perfect for any active lifestyle. Lightweight, breathable, and made from high-quality material.</p>
        <p>It is 88% recycled polyester and 12% elastane in the EU, and 81% recycled polyester and 19% spandex Lycra in the US.</p>
      </>
    ),
    yoga_pants: (
      <>
        <p>These yoga pants offer full flexibility and comfort for any yoga session. Stretchy and supportive.</p>
        <p>Made with 82% organic cotton and 18% spandex for optimal stretch.</p>
      </>
    ),
    yoga_mat: (
      <>
        <p>This yoga mat is extra cushioned for support during your poses.</p>
        <p>6mm thick eco-friendly rubber base with a microsuede top layer.</p>
      </>
    ),
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
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1rem",
          width: "100%",
          zIndex: 10,
          position: "relative",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ cursor: "pointer" }} onClick={() => (state.intro = true)}>
            <img src={Logo} alt="Logo" width="80" height="80" />
          </div>
          <a
            href="https://www.tiktok.com/@yogalooshop"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src="/tiktok.png" alt="TikTok" width="40" height="40" />
          </a>
        </div>

        <AiOutlineShopping
          size="4em"
          style={{ cursor: "pointer", color: snap.selectedColor }}
          onClick={() => setCartOpen(!cartOpen)}
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
              backgroundColor: "#fff",
              padding: "2rem",
              borderRadius: "10px",
              zIndex: 9999,
              width: "80%",
              maxWidth: "500px",
            }}
          >
            <h3>{snap.selectedModel}</h3>
            {itemDescription[snap.selectedModel]}
            <button onClick={() => setDescriptionOpen(false)}>Close</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Modal */}
      <AnimatePresence>
        {cartOpen && (
          <motion.form
            className="cart-modal"
            onSubmit={handleSendAndPay}
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={transition}
            style={{
              position: "absolute",
              top: "100px",
              right: "20px",
              background: "#fff",
              padding: "1.5rem",
              borderRadius: "12px",
              width: "300px",
              zIndex: 9999,
            }}
          >
            <h3>🛍️ Your Order</h3>

            {[
              { label: "Size", name: "size" },
              { label: "Quantity", name: "quantity" },
              { label: "Email", name: "email" },
              { label: "Street Address", name: "streetAddress" },
              { label: "Postal Code", name: "postalCode" },
              { label: "Country", name: "country" },
            ].map((field) => (
              <div key={field.name}>
                <label>{field.label}</label>
                <input
                  type={field.name === "quantity" ? "number" : "text"}
                  name={field.name}
                  required
                  min={field.name === "quantity" ? 1 : undefined}
                  value={formData[field.name]}
                  onChange={handleInputChange}
                />
              </div>
            ))}

            <p><strong>Total:</strong> ${totalPrice}</p>

            <button
              type="submit"
              style={{
                marginTop: "0.8rem",
                background: "#0070ba",
                color: "white",
                padding: "0.8rem",
                width: "100%",
                fontWeight: "bold",
                borderRadius: "8px",
                border: "none",
              }}
            >
              💳 SEND INFO & PAY NOW
            </button>
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
          <p>
            <strong>Rotate this model</strong> and get ready for yoga season!
          </p>
          <p>Shipping from EU & USA</p>
          <p><strong>Yoga loo</strong> © 2025</p>
          <button style={{ background: "black" }} onClick={() => (state.intro = false)}>
            pick your aura <AiOutlineHighlight size="1.3em" />
          </button>
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
            {["sports_tee", "yoga_pants", "yoga_mat"].map((model) => (
              <button
                key={model}
                className={snap.selectedModel === model ? "active" : ""}
                style={{ background: snap.selectedColor === "white" ? "#ccc" : snap.selectedColor }}
                onClick={() => (state.selectedModel = model)}
              >
                {model.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* ✅ Restored color names on hover */}
        <div className="color-options">
          {snap.colors.map((color) => (
            <div
              key={color.code}
              id={color.name}
              title={color.name} // ✅ Hover shows color name
              className="circle"
              style={{ background: color.code }}
              onClick={() => (state.selectedColor = color.code)}
            />
          ))}
        </div>

        <button
          className="share"
          style={{ background: snap.selectedColor === "white" ? "#ccc" : snap.selectedColor }}
          onClick={() => {
            const link = document.createElement("a");
            link.setAttribute("download", "canvas.png");
            link.setAttribute(
              "href",
              document.querySelector("canvas")
                .toDataURL("image/png")
                .replace("image/png", "image/octet-stream")
            );
            link.click();
          }}
        >
          DOWNLOAD <AiFillCamera size="1.3em" />
        </button>
      </div>
    </motion.section>
  );
}
