import { useState } from "react";

export default function Item1() {
  const [stocks, setStocks] = useState([]);
  const [symbol, setSymbol] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");

  const addStock = () => {
    if (symbol && quantity && price) {
      setStocks([...stocks, { symbol, quantity, price }]);
      setSymbol("");
      setQuantity("");
      setPrice("");
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto border border-gray-100">
      <div className="flex space-x-2 mb-4">
        <input
          type="text"
          placeholder="Stock Symbol"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          className="border border-gray-300 p-2 rounded-md flex-1 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition"
        />
        <input
          type="number"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="border border-gray-300 p-2 rounded-md flex-1 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition"
        />
        <input
          type="number"
          placeholder="Price per Share ($)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="border border-gray-300 p-2 rounded-md flex-1 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition"
        />
        <button
          type="button"
          onClick={addStock}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200 shadow-sm"
        >
          Add Stock
        </button>
      </div>

      <h3 className="text-lg font-semibold mt-4 mb-2 text-gray-800">Stock List</h3>
      {stocks.length === 0 ? (
        <p className="text-gray-500 italic">No stocks added yet</p>
      ) : (
        <ul className="list-disc pl-5 mt-2 space-y-1">
          {stocks.map((stock, index) => (
            <li key={index} className="text-gray-700">
              <span className="font-medium">{stock.symbol}</span> - {stock.quantity} shares @ ${stock.price}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
