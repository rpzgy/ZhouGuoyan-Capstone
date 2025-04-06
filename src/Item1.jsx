import { useState, useEffect, useContext, createContext, useCallback } from "react";

const API_KEY = "BD6T04CDP751LLO6";
const StockContext = createContext();

export default function Item1() {
  const [stocks, setStocks] = useState([]);
  const [symbol, setSymbol] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  const fetchStockData = useCallback(async (stockSymbol) => {
    try {
      const response = await fetch(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stockSymbol}&apikey=${API_KEY}`
      );
      const data = await response.json();
      
      if (data["Global Quote"] && data["Global Quote"]["05. price"]) {
        return parseFloat(data["Global Quote"]["05. price"]);
      }
      return null;
    } catch (err) {
      console.error("Error fetching stock data:", err);
      return null;
    }
  }, []);

  
  useEffect(() => {
    const updateStockPrices = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const updatedStocks = await Promise.all(
          stocks.map(async (stock) => {
            const currentPrice = await fetchStockData(stock.symbol);
            return {
              ...stock,
              currentPrice,
              profitLoss: currentPrice 
                ? (currentPrice - stock.price) * stock.quantity 
                : null
            };
          })
        );
        setStocks(updatedStocks);
      } catch (err) {
        setError("Failed to update stock prices. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (stocks.length > 0) {
      updateStockPrices();
    }
  }, [stocks.length, fetchStockData]);

  const addStock = async () => {
    if (!symbol || !quantity || !price) return;

    setLoading(true);
    setError(null);
    
    try {

      const currentPrice = await fetchStockData(symbol);
      
      if (currentPrice === null) {
        setError("Invalid stock symbol. Please enter a valid symbol.");
        return;
      }

      const newStock = {
        symbol: symbol.toUpperCase(),
        quantity: parseFloat(quantity),
        price: parseFloat(price),
        currentPrice,
        profitLoss: (currentPrice - parseFloat(price)) * parseFloat(quantity)
      };

      setStocks([...stocks, newStock]);
      setSymbol("");
      setQuantity("");
      setPrice("");
    } catch (err) {
      setError("Failed to add stock. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <StockContext.Provider value={{ stocks, setStocks }}>
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-3xl mx-auto border border-gray-100">
        {/* Stock Input Form */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
            <input
              type="text"
              placeholder="Stock Symbol (e.g., AAPL)"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="border border-gray-300 p-2 rounded-md flex-1 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition"
            />
            <input
              type="number"
              placeholder="Quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="1"
              className="border border-gray-300 p-2 rounded-md w-24 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition"
            />
            <input
              type="number"
              placeholder="Price per Share ($)"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              min="0.01"
              step="0.01"
              className="border border-gray-300 p-2 rounded-md w-32 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition"
            />
            <button
              type="button"
              onClick={addStock}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200 shadow-sm disabled:bg-blue-400"
            >
              {loading ? "Adding..." : "Add Stock"}
            </button>
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>

        {/* Stock List */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-700">Stock List</h3>
          {loading && stocks.length === 0 ? (
            <p className="text-gray-500 italic">Loading your stocks...</p>
          ) : stocks.length === 0 ? (
            <p className="text-gray-500 italic">No stocks added yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purchase Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit/Loss</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stocks.map((stock, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{stock.symbol}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">{stock.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">${stock.price.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {stock.currentPrice ? `$${stock.currentPrice.toFixed(2)}` : "N/A"}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap font-medium ${
                        stock.profitLoss > 0 ? "text-green-600" : "text-red-600"
                      }`}>
                        {stock.profitLoss !== null ? 
                          `$${Math.abs(stock.profitLoss).toFixed(2)} ${stock.profitLoss >= 0 ? "↑" : "↓"}` : 
                          "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </StockContext.Provider>
  );
}

// import { useState,useEffect,useContext,createContext,useCallback } from "react";

// const API_KEY = "BD6T04CDP751LLO6";
// const StockContext = createContext();
// export default function Item1() {
//   const [stocks, setStocks] = useState([]);
//   const [symbol, setSymbol] = useState("");
//   const [quantity, setQuantity] = useState("");
//   const [price, setPrice] = useState("");

//   const addStock = () => {
//     if (symbol && quantity && price) {
//       setStocks([...stocks, { symbol, quantity, price }]);
//       setSymbol("");
//       setQuantity("");
//       setPrice("");
//     }
//   };

//   return (
//     <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto border border-gray-100">
//       <div className="flex space-x-2 mb-4">
//         <input
//           type="text"
//           placeholder="Stock Symbol"
//           value={symbol}
//           onChange={(e) => setSymbol(e.target.value)}
//           className="border border-gray-300 p-2 rounded-md flex-1 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition"
//         />
//         <input
//           type="number"
//           placeholder="Quantity"
//           value={quantity}
//           onChange={(e) => setQuantity(e.target.value)}
//           className="border border-gray-300 p-2 rounded-md flex-1 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition"
//         />
//         <input
//           type="number"
//           placeholder="Price per Share ($)"
//           value={price}
//           onChange={(e) => setPrice(e.target.value)}
//           className="border border-gray-300 p-2 rounded-md flex-1 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition"
//         />
//         <button
//           type="button"
//           onClick={addStock}
//           className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200 shadow-sm"
//         >
//           Add Stock
//         </button>
//       </div>

//       <h3 className="text-lg font-semibold mt-4 mb-2 text-gray-800">Stock List</h3>
//       {stocks.length === 0 ? (
//         <p className="text-gray-500 italic">No stocks added yet</p>
//       ) : (
//         <ul className="list-disc pl-5 mt-2 space-y-1">
//           {stocks.map((stock, index) => (
//             <li key={index} className="text-gray-700">
//               <span className="font-medium">{stock.symbol}</span> - {stock.quantity} shares @ ${stock.price}
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// }
