"use client";
import axios from "axios";
import { useState, useEffect, useMemo } from "react";

import "./design.css";
import { showAlertError } from "./Components/Alerts/errorAlerts";
import { AlertSucces } from "./Components/Alerts/successAlert";
import { showConfirmation } from "./Components/Alerts/confirmation";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import 'bootstrap/dist/css/bootstrap.min.css';
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const MainPage = () => {
  const [type, setType] = useState("expense");
  const [date, setDate] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  // Base URL of your PHP API (running under Apache/XAMPP, etc.)
  // 404 usually means we were calling the Next.js dev server on port 3000 instead of PHP.
  const URL = "http://localhost/budgetTracker/api/";


  const [typeList, setTypeList] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const [categoryName, setCategoryName] = useState("");
  const [categoryType, setCategoryType] = useState("");

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [historyCategory, setHistoryCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 5;
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [editForm, setEditForm] = useState({
    transaction_id: null,
    type: "expense",
    category_id: "",
    amount: "",
    description: "",
    date: "",
  });

  async function getCategory() {
    try {
      const response = await axios.get(URL + "getCategory.php", {
        params: {
          operation: "getCategory",
          json: JSON.stringify([]),
        },
      });
      // Expect the API to return an array of category objects
      setCategories(response.data || []);
      console.log(response.data);
    } catch (error) {
      console.error(
        "Error fetching categories:",
        error?.response?.status,
        error?.response?.config?.url,
        error
      );
    }
  }

  async function getType() {
    try {
      const response = await axios.get(URL + "getCategory.php", {
        params: {
          operation: "getTypes",
          json: JSON.stringify([]),
        },
      });
      // Expect the API to return an array of category objects
      setTypeList(response.data || []);
      console.log(response.data);
    } catch (error) {
      console.error(
        "Error fetching types:",
        error?.response?.status,
        error?.response?.config?.url,
        error
      );
    }
  }

  async function getTransaction() {
    try {
      const response = await axios.get(URL + "transaction.php", {
        params: {
          operation: "getTransaction",
          json: JSON.stringify([]),
        },
      });
      // Expect the API to return an array of category objects
      setTransactions(response.data || []);
      console.log(response.data);
    } catch (error) {
      console.error(
        "Error fetching Transactions:",
        error?.response?.status,
        error?.response?.config?.url,
        error
      );
    }
  }

  async function getTransactionByID(transaction_id) {
    try {
      const response = await axios.get(URL + "transaction.php", {
        params: {
          operation: "getTransactionByID",
          json: JSON.stringify({ Transaction_id: transaction_id }),
        },
      });
      // Expect the API to return an array of category objects
      // setTransactionByID(response.data || []);
      console.log(response.data);
    } catch (error) {
      console.error(
        "Error fetching Transactions:",
        error?.response?.status,
        error?.response?.config?.url,
        error
      );
    }
  }

  const today = new Date().toISOString().split("T")[0];
  const isFutureDate = date && date > today;

  const formatCurrency = (value) =>
    (Number(value) || 0).toLocaleString("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const formatDate = (value) => {
    if (!value) return "—";
    const dateObj = new Date(value);
    if (Number.isNaN(dateObj.getTime())) return value;
    return new Intl.DateTimeFormat("en-PH", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }).format(dateObj);
  };

  const getAmountValue = (tx) =>
    typeof tx.ammount === "number"
      ? tx.ammount
      : typeof tx.amount === "number"
        ? tx.amount
        : Number(tx.ammount || tx.amount || 0);

  const { incomeTotal, expenseTotal, balance } = useMemo(() => {
    return transactions.reduce(
      (acc, tx) => {
        const typeName = (tx.type_name || tx.type || "").toLowerCase();
        const amt = getAmountValue(tx);
        if (typeName === "income") acc.incomeTotal += amt;
        else acc.expenseTotal += amt;
        acc.balance = acc.incomeTotal - acc.expenseTotal;
        return acc;
      },
      { incomeTotal: 0, expenseTotal: 0, balance: 0 }
    );
  }, [transactions]);

  useEffect(() => {
    getCategory();
    getTransaction();
    getType();
  }, []);

  const refreshDate = () => {
    getCategory();
    getTransaction();
    getType();
  }

  const addTransaction = async () => {
    const allValid =
      amount &&
      Number(amount) > 0 &&
      selectedCategory &&
      date &&
      !isFutureDate

    if (!allValid) {
      showAlertError({
        icon: "warning",
        title: "Details Missing",
        text: "All fields must be filled out correctly.",
        button: "OK",
      });
      return;
    }

    const data = {
      Amount: amount,
      Category_id: selectedCategory,
      Date: date,
      Description: description
    }
    try {
      const response = await axios.get(URL + "transaction.php", {
        params: {
          operation: "addTransaction",
          json: JSON.stringify(data),
        },
      });
      if (response.data == 'Success') {
        AlertSucces(
          "Transactions is successfully saved!",
          "success",
          true,
          'Okay'
        );
        refreshDate();
      } else {
        const errorText =
          (response?.data && response.data.message) ||
          "The transaction is not saved.";
        showAlertError({
          icon: "error",
          title: "Failed to save transaction",
          text: errorText,
          button: "Try Again",
        });
      }
    } catch (error) {
      console.error(
        "Error fetching categories:",
        error?.response?.status,
        error?.response?.config?.url,
        error
      );
    }



    // console.log(data);

    // All fields valid – TODO: send to API / update state
  };

  const deleteTransaction = async (transaction_id) => {
    const transactionID = transaction_id;
    const result = await showConfirmation(
      "Are you sure?",
      "Are you sure you want to delete this transaction?",
      "Yes, delete it!",
      "Cancel",
      "warning",
      "Deleted!",
      "Your transaction was deleted.",
      "success"
    );

    if (result?.isConfirmed) {



      // console.log("Delete transaction id:", transactionID);
      try {
        const response = await axios.get(URL + "transaction.php", {
          params: {
            operation: "deleteTransaction",
            json: JSON.stringify({ Transaction_id: transactionID, operation: "deleteTransaction" }),
          },
        });
        if (response.data == 'Success') {

          refreshDate();
        } else {
          showAlertError({
            icon: "error",
            title: "Failed to delete transaction",
            text: response.data,
            button: "OK",
          });
          refreshDate();
        }
      } catch (error) {
        console.error(
          "Error deleting transaction:",
          error?.response?.status,
          error?.response?.config?.url,
          error
        );
      }
      refreshDate();
    } else {
      // User cancelled
    }
  };

  const categoryFilterOptions = useMemo(() => {
    return categories.filter((cat) => {
      if (filterType === "income") {
        return cat.type_name === "Income" || cat.type_id === 1;
      }
      if (filterType === "expense") {
        return cat.type_name === "Expense" || cat.type_id === 2;
      }
      return true;
    });
  }, [categories, filterType]);

  const filteredTransactions = useMemo(() => {
    let result = transactions;

    if (filterType !== "all") {
      result = result.filter((tx) => {
        const typeName = (tx.type_name || tx.type || "").toLowerCase();
        return filterType === typeName;
      });
    }

    if (historyCategory !== "all") {
      result = result.filter((tx) => {
        const txCatId =
          tx.category_id ?? tx.Category_id ?? tx.categoryId ?? null;
        const txCatName = (tx.category_name || tx.category || "").toString();
        const target = historyCategory.toString();
        return (
          (txCatId !== null && String(txCatId) === target) ||
          txCatName === target
        );
      });
    }

    return result;
  }, [transactions, filterType, historyCategory]);

  const expenseByCategory = useMemo(() => {
    const totals = {};
    filteredTransactions.forEach((tx) => {
      const typeName = (tx.type_name || tx.type || "").toLowerCase();
      if (typeName !== "expense") return;
      const key = tx.category_name || tx.category || "Uncategorized";
      const amt = getAmountValue(tx);
      totals[key] = (totals[key] || 0) + amt;
    });
    const labels = Object.keys(totals);
    const data = labels.map((l) => totals[l]);
    return {
      labels,
      data,
    };
  }, [filteredTransactions]);

  const handleAddCategory = async () => {
    // showAlertError({
    //   icon: "info",
    //   title: "Add Category",
    //   text: "Category creation is not implemented yet. Wire this button to your API or a category page.",
    //   button: "OK",
    // });
    const isExist = categories.find(
      cat =>
        cat.category_name?.toLowerCase() === categoryName?.toLowerCase()
    );
    if (isExist) {
      showAlertError({
        icon: "error",
        title: "Category already exists",
        text: "The category name already exists. Please choose a different name.",
        button: "OK",
      });
      return;
    }



    const data = {
      Category_name: categoryName,
      Type_id: categoryType,
    }

    try {
      const response = await axios.get(URL + "getCategory.php", {
        params: {
          operation: "addCategory",
          json: JSON.stringify(data),
        },
      });
      if (response.data == "Success") {
        AlertSucces("Category added!", "success", true, "Okay");

        refreshDate();
        setShowAddCategoryModal(false);
        setCategoryName("");
        setCategoryType("");
      } else {
        showAlertError({
          icon: "error",
          title: "Failed to update",
          text: response.data,
          button: "Try Again",
        });
      }
    } catch (error) {
      console.error(
        "Error updating transaction:",
        error?.response?.status,
        error?.response?.config?.url,
        error
      );
      showAlertError({
        icon: "error",
        title: "Failed to update",
        text: "Please try again.",
        button: "OK",
      });
    }





  };

  const monthlyTotals = useMemo(() => {
    const months = {};
    filteredTransactions.forEach((tx) => {
      const typeName = (tx.type_name || tx.type || "").toLowerCase();
      const amt = getAmountValue(tx);
      if (!tx.date) return;
      const dateObj = new Date(tx.date);
      if (Number.isNaN(dateObj.getTime())) return;
      const key = `${dateObj.getFullYear()}-${String(
        dateObj.getMonth() + 1
      ).padStart(2, "0")}`;
      if (!months[key]) {
        months[key] = { income: 0, expense: 0 };
      }
      if (typeName === "income") months[key].income += amt;
      else months[key].expense += amt;
    });
    const sortedKeys = Object.keys(months).sort();
    const labelsFormatted = sortedKeys.map((k) => {
      const [y, m] = k.split("-");
      const dateObj = new Date(Number(y), Number(m) - 1, 1);
      return new Intl.DateTimeFormat("en-PH", {
        month: "short",
        year: "numeric",
      }).format(dateObj);
    });
    return {
      labels: sortedKeys,
      labelsFormatted,
      income: sortedKeys.map((k) => months[k].income),
      expense: sortedKeys.map((k) => months[k].expense),
    };
  }, [filteredTransactions]);

  const openEditModal = (tx) => {
    const typeName = (tx.type_name || tx.type || "").toLowerCase();
    setEditForm({
      transaction_id: tx.transaction_id || tx.id || null,
      type: typeName === "income" ? "income" : "expense",
      category_id: tx.category_id || tx.categoryId || "",
      amount: getAmountValue(tx),
      description: tx.description || "",
      date: tx.date || "",
    });
    setShowEditModal(true);
  };

  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const saveEdit = async () => {
    const { transaction_id, amount, category_id, date, description, type } =
      editForm;
    const allValid =
      transaction_id &&
      amount &&
      Number(amount) > 0 &&
      category_id &&
      date &&
      !isFutureDate;

    if (!allValid) {
      showAlertError({
        icon: "warning",
        title: "Details Missing",
        text: "All fields must be filled out correctly.",
        button: "OK",
      });
      return;
    }

    const data = {
      Transaction_id: transaction_id,
      Amount: amount,
      Category_id: category_id,
      Date: date,
      Description: description,
      // Type: type === "income" ? 1 : 2,
    };

    try {
      const response = await axios.get(URL + "transaction.php", {
        params: {
          operation: "editTransaction",
          json: JSON.stringify(data),
        },
      });
      if (response.data == "Success") {
        AlertSucces("Transaction updated!", "success", true, "Okay");
        setShowEditModal(false);
        refreshDate();
      } else {
        showAlertError({
          icon: "error",
          title: "Failed to update",
          text: response.data,
          button: "Try Again",
        });
      }
    } catch (error) {
      console.error(
        "Error updating transaction:",
        error?.response?.status,
        error?.response?.config?.url,
        error
      );
      showAlertError({
        icon: "error",
        title: "Failed to update",
        text: "Please try again.",
        button: "OK",
      });
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, historyCategory, transactions]);

  useEffect(() => {
    // Reset category filter when type filter changes so options stay valid
    setHistoryCategory("all");
  }, [filterType]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTransactions.length / PAGE_SIZE)
  );

  const pagedTransactions = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredTransactions.slice(start, start + PAGE_SIZE);
  }, [filteredTransactions, currentPage]);

  return (
    <div className="page">
      <div className="page__header">
        <h1>Personal Finance Tracker</h1>
        <p>Manage your income and expenses</p>
      </div>

      <div className="page__content">
        <section className="card form-card">
          <div className="card__title">Add Transaction</div>

          <label className="field">
            <span className="field__label">Type</span>
            <div className="type-toggle">
              <button
                type="button"
                className={`type-toggle__btn ${type === "expense" ? "is-active expense" : ""
                  }`}
                onClick={() => setType("expense")}
              >
                Expense
              </button>
              <button
                type="button"
                className={`type-toggle__btn ${type === "income" ? "is-active income" : ""
                  }`}
                onClick={() => setType("income")}
              >
                Income
              </button>
            </div>
          </label>

          <label className="field">
            <span className="field__label">Amount</span>
            <div className="input-prefix">
              <span>₱</span>
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </label>

          <label className="field">
            <span className="field__label">Category</span>
            <div className="field-row">
              <select
                className="select-input"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">Select category</option>
                {categories
                  .filter((cat) =>
                    type === "income"
                      ? cat.type_name === "Income" || cat.type_id === 1
                      : cat.type_name === "Expense" || cat.type_id === 2
                  )
                  .map((cat) => (
                    <option key={cat.category_id} value={cat.category_id}>
                      {cat.category_name}
                    </option>
                  ))}
              </select>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setShowAddCategoryModal(true)}
              >
                + Add
              </button>
            </div>
          </label>

          <label className="field">
            <span className="field__label">Date</span>
            <input
              type="date"
              max={today}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            {isFutureDate && (
              <span className="field__error">
                Date cannot be in the future.
              </span>
            )}
          </label>

          <label className="field">
            <span className="field__label">Description</span>
            <input
              type="text"
              placeholder="Optional notes"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>

          <button
            className="primary-btn"
            type="button"
            disabled={isFutureDate}
            onClick={addTransaction}
          >
            + Add Transaction
          </button>
        </section>

        <section className="overview">
          <div className="summary">
            <div className="summary__card balance">
              <div className="summary__meta">
                <span className="summary__icon balance" aria-hidden>
                  🏦
                </span>
                <span className="summary__title">Balance</span>
              </div>
              <div className="summary__amount">
                {formatCurrency(balance)}
              </div>
            </div>
            <div className="summary__card income">
              <div className="summary__meta">
                <span className="summary__icon income" aria-hidden>
                  📈
                </span>
                <span className="summary__title">Income</span>
              </div>
              <div className="summary__amount">
                {formatCurrency(incomeTotal)}
              </div>
            </div>
            <div className="summary__card expenses">
              <div className="summary__meta">
                <span className="summary__icon expenses" aria-hidden>
                  📉
                </span>
                <span className="summary__title">Expenses</span>
              </div>
              <div className="summary__amount">
                {formatCurrency(expenseTotal)}
              </div>
            </div>
          </div>

        </section>
      </div>

      <section className="charts">
        <div className="card chart-card">
          <div className="card__title">Spending by Category</div>
          <div className="chart__body">
            {expenseByCategory.labels.length ? (
              <Pie
                data={{
                  labels: expenseByCategory.labels,
                  datasets: [
                    {
                      data: expenseByCategory.data,
                      backgroundColor: [
                        "#e03136",
                        "#10b364",
                        "#ffc107",
                        "#0b0f2a",
                        "#6c5ce7",
                        "#00bcd4",
                      ],
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  plugins: {
                    legend: { position: "bottom" },
                  },
                  maintainAspectRatio: false,
                }}
              />
            ) : (
              <div className="chart__empty">No expense data</div>
            )}
          </div>
        </div>

        <div className="card chart-card">
          <div className="card__title">Monthly Overview</div>
          <div className="chart__body">
            {monthlyTotals.labels.length ? (
              <Bar
                data={{
                  labels: monthlyTotals.labelsFormatted,
                  datasets: [
                    {
                      label: "Income",
                      data: monthlyTotals.income,
                      backgroundColor: "#10b364",
                    },
                    {
                      label: "Expenses",
                      data: monthlyTotals.expense,
                      backgroundColor: "#e03136",
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: "bottom" },
                  },
                  maintainAspectRatio: false,
                }}
              />
            ) : (
              <div className="chart__empty">No monthly data</div>
            )}
          </div>
        </div>
      </section>

      <section className="history card">
         <div className="history__header">
           <div>
             <div className="history__title">Transaction History</div>
             <div className="history__subtitle">
               Recent income and expenses
             </div>
           </div>
           <div className="history__controls">
             <select
               className="select-input history__category-filter"
               value={historyCategory}
               onChange={(e) => setHistoryCategory(e.target.value)}
             >
               <option value="all">All categories</option>
              {categoryFilterOptions.map((cat) => (
                 <option key={cat.category_id} value={cat.category_id}>
                   {cat.category_name}
                 </option>
               ))}
             </select>
             <div className="history__filter-chips">
               {["all", "income", "expense"].map((option) => (
                 <button
                   key={option}
                   type="button"
                   className={`chip ${filterType === option ? "is-active" : ""}`}
                   onClick={() => setFilterType(option)}
                 >
                   {option === "all"
                     ? "All"
                     : option === "income"
                       ? "Income"
                       : "Expense"}
                 </button>
               ))}
             </div>
             <div className="history__count">
               {filteredTransactions.length}{" "}
               {filteredTransactions.length === 1 ? "item" : "items"}
             </div>
           </div>
         </div>

        <div className="history__table-wrapper">
          <table className="history__table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Category / Date</th>
                <th>Description</th>
                <th className="history__amount">Amount</th>
                <th className="history__actions-head">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagedTransactions.map((tx) => {
                const typeName = (tx.type_name || tx.type || "").toLowerCase();
                const isIncome = typeName === "income";
                const amountValue =
                  typeof tx.ammount === "number"
                    ? tx.ammount
                    : typeof tx.amount === "number"
                      ? tx.amount
                      : Number(tx.ammount || tx.amount || 0);

                return (
                  <tr
                    className="history__row"
                    key={tx.transaction_id || tx.id || tx.category_id}
                  >
                    <td>
                      <span
                        className={`history__pill ${isIncome ? "income" : "expense"
                          }`}
                        aria-label={isIncome ? "Income" : "Expense"}
                      >
                        {isIncome ? "📈" : "📉"}
                      </span>
                    </td>
                    <td>
                      <div className="history__category">
                        {tx.category_name || tx.category || "—"}
                      </div>
                      <div className="history__date">{formatDate(tx.date)}</div>
                    </td>
                    <td className="history__description">
                      {tx.description || "—"}
                    </td>
                    <td className="history__amount">
                      {isIncome ? "+" : "-"}₱{amountValue.toFixed(2)}
                    </td>
                    <td className="history__amoount">
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <button
                          type="button"
                          className="icon-btn icon-btn--edit"
                          onClick={() => openEditModal(tx)}
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          className="icon-btn icon-btn--delete"
                          onClick={() => deleteTransaction(tx.transaction_id)}
                        >
                          🗑️
                        </button>
                      </div>
                  
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="history__pagination">
          <button
            type="button"
            className="icon-btn icon-btn--text"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            ◀ Prev
          </button>
          <span className="history__page-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            className="icon-btn icon-btn--text"
            onClick={() =>
              setCurrentPage((p) => Math.min(totalPages, p + 1))
            }
            disabled={currentPage >= totalPages}
          >
            Next ▶
          </button>
        </div>
      </section>


      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size='md'>
        <Modal.Header closeButton>
          <Modal.Title>Edit Transaction</Modal.Title>
        </Modal.Header>
        <Modal.Body className='modal-add-product-body'>
          <label className="field">
            <span className="field__label">Type</span>
            <div className="type-toggle">
              <button
                type="button"
                className={`type-toggle__btn ${editForm.type === "expense" ? "is-active expense" : ""
                  }`}
                onClick={() => handleEditChange("type", "expense")}
              >
                Expense
              </button>
              <button
                type="button"
                className={`type-toggle__btn ${editForm.type === "income" ? "is-active income" : ""
                  }`}
                onClick={() => handleEditChange("type", "income")}
              >
                Income
              </button>
            </div>
          </label>

          <label className="field">
            <span className="field__label">Amount</span>
            <div className="input-prefix">
              <span>₱</span>
              <input
                type="number"
                placeholder="0.00"
                value={editForm.amount}
                onChange={(e) =>
                  handleEditChange("amount", e.target.value)
                }
              />
            </div>
          </label>

          <label className="field">
            <span className="field__label">Category</span>
            <div className="field-row">
              <select
                className="select-input"
                value={editForm.category_id}
                onChange={(e) =>
                  handleEditChange("category_id", e.target.value)
                }
              >
                <option value="">Select category</option>
                {categories
                  .filter((cat) =>
                    editForm.type === "income"
                      ? cat.type_name === "Income" || cat.type_id === 1
                      : cat.type_name === "Expense" || cat.type_id === 2
                  )
                  .map((cat) => (
                    <option key={cat.category_id} value={cat.category_id}>
                      {cat.category_name}
                    </option>
                  ))}
              </select>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setShowAddCategoryModal(true)}

              >
                + Add
              </button>
            </div>
          </label>

          <label className="field">
            <span className="field__label">Date</span>
            <input
              type="date"
              max={today}
              value={editForm.date}
              onChange={(e) => handleEditChange("date", e.target.value)}
            />
          </label>

          <label className="field">
            <span className="field__label">Description</span>
            <input
              type="text"
              placeholder="Optional notes"
              value={editForm.description}
              onChange={(e) =>
                handleEditChange("description", e.target.value)
              }
            />
          </label>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={saveEdit}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showAddCategoryModal} onHide={() => setShowAddCategoryModal(false)} size='md'>
        <Modal.Header closeButton>
          <Modal.Title>Add Category</Modal.Title>
        </Modal.Header>
        <Modal.Body className='modal-add-product-body'>



          <label className="field">
            <span className="field__label">Category Name</span>
            <input
              type="text"
              placeholder="Category Name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
            />
          </label>

          <label className="field">
            <span className="field__label">Type</span>
            <div className="field-row">
              <select
                className="select-input"
                value={categoryType}
                onChange={(e) =>
                  setCategoryType(e.target.value)
                }
              >
                <option value="">Select category</option>
                {typeList
                  .map((type) => (
                    <option key={type.type_id} value={type.type_id}>
                      {type.type_name}
                    </option>
                  ))}
              </select>

            </div>
          </label>

        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddCategoryModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleAddCategory}>
            Save Category
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default MainPage;