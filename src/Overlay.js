import Logo from "./yl.png";
import { useGLTF, useTexture } from "@react-three/drei";
import { Decal } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import React, { useMemo, useState, useEffect } from "react";
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

  useEffect(() => {
    // Load PayPal button script dynamically
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=LY2KF2K54A4MA_ID&components=buttons`;
    script.async = true;
    script.onload = () => {
      window.paypal.Buttons({
        createOrder: (data, actions) => {
          return actions.order.create({
            purchase_units: [{
              amount: {
                value: totalPrice,
              },
            }],
          });
        },
        onApprove: (data, actions) => {
          return actions.order.capture().then((details) => {
            alert('Payment successful: ' + details.payer.name.given_name);
            // You can also send the payment details to your server here if needed
            // After successful payment, you can submit the order form.
            handleSendOrder(data);
          });
        },
        onError: (err) => {
          console.error('Error:', err);
          alert('Payment failed. Please try again.');
        },
      }).render("#paypal-button-container");
    };
    document.body.appendChild(script);
  }, [totalPrice]);

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
        <div
          style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
          onClick={() => {
            state.intro = true;
          }}
        >
          <img src={Logo} alt="Logo" width="80" height="80" />
        </div>
        <AiOutlineShopping
          size="2.5em"
          style={{ cursor: "pointer" }}
          onClick={() => setCartOpen(true)}
        />
      </motion.header>

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
              background: snap.selectedColor === "black" ? "#333333" : snap.selectedColor || "#fff", // Cart modal logic here
              padding: "1.5rem",
              borderRadius: "12px",
              boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
              zIndex: 999,
              width: "300px",
            }}
          >
            <h3>🛍️ Your Order</h3>
            <p>Item: {snap.selectedModel}</p>
            <p>Color: {snap.selectedColor}</p>
            <p>Total Price: ${totalPrice}</p> {/* Display total price */}

            <label>
              Size:
              <select name="size" value={formData.size} onChange={handleInputChange}>
                <option>S</option>
                <option>M</option>
                <option>L</option>
                <option>XL</option>
              </select>
            </label>

            <label>
              Quantity:
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                min="1"
              />
            </label>

            <label>
              Email:
              <input type="email" name="email" required value={formData.email} onChange={handleInputChange} />
            </label>

            <label>
              Street Address:
              <input
                type="text"
                name="streetAddress"
                required
                value={formData.streetAddress}
                onChange={handleInputChange}
              />
            </label>

            <label>
              Postal Code:
              <input
                type="text"
                name="postalCode"
                required
                value={formData.postalCode}
                onChange={handleInputChange}
              />
            </label>

            <label>
              Country:
              <input
                type="text"
                name="country"
                required
                value={formData.country}
                onChange={handleInputChange}
              />
            </label>

            <label>
              Upload Image (Optional):
              <input type="file" name="image" accept="image/*" onChange={handleInputChange} />
            </label>

            <div id="paypal-button-container"></div> {/* PayPal Button */}

            <button type="submit" style={{ marginTop: "1rem" }}>
              <FaPaypal /> Send Order
            </button>
            <button
              type="button"
              onClick={() => setCartOpen(false)}
              style={{ marginTop: "0.5rem", background: "red", border: "none", textDecoration: "underline" }}
            >
              Cancel
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
          <h1>LET'S DO IT.</h1>
        </div>
        <div className="support--content">
          <div>
            <p>
              Get ready for yoga season with our brand-new cute little 3D
              webshop. <strong>Treat your body like a temple.</strong>
              pick your favorite color.
            </p>
            <button
              style={{ background: "black" }}
              onClick={() => (state.intro = false)}
            >
              CUSTOMIZE IT <AiOutlineHighlight size="1.3em" />
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
              onClick={() => (state.selectedColor = color)} // Apply the updated color change logic
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
