import { BrowserRouter, Routes, Route } from "react-router-dom";
import Checkout from "./pages/Checkout";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailed from "./pages/PaymentFailed";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Checkout />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/success" element={<PaymentSuccess />} />
        <Route path="/failed" element={<PaymentFailed />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;