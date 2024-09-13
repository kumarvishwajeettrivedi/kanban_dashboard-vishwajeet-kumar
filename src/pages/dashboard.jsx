import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "../styles/dashboard.css";

import DoneIcon from "../assets/icons/Done.svg";
import DownIcon from "../assets/icons/down.svg";
import HighPriorityIcon from "../assets/icons/Img - High Priority.svg";
import LowPriorityIcon from "../assets/icons/Img - Low Priority.svg";
import MediumPriorityIcon from "../assets/icons/Img - Medium Priority.svg";
import NoPriorityIcon from "../assets/icons/No-priority.svg";
import UrgentPriorityColourIcon from "../assets/icons/SVG - Urgent Priority colour.svg";
import UrgentPriorityGreyIcon from "../assets/icons/SVG - Urgent Priority grey.svg";
import ToDoIcon from "../assets/icons/To-do.svg";
import InProgressIcon from "../assets/icons/in-progress.svg";
import BacklogIcon from "../assets/icons/Backlog.svg";
import DisplayIcon from "../assets/icons/Display.svg";
import CancelIcon from "../assets/icons/Cancelled.svg";
import AddIcon from "../assets/icons/add.svg";
import DotIcon from "../assets/icons/3 dot menu.svg";

const DashBoard = () => {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [grouping, setGrouping] = useState("status");
  const [sortOption, setSortOption] = useState("priority");
  const [displayMenuOpen, setDisplayMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://api.quicksell.co/v1/internal/frontend-assignment"
        );
        setTickets(response.data.tickets);
        setUsers(response.data.users);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setDisplayMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const groupTickets = (tickets, grouping) => {
    const priorityNames = {
      4: "Urgent",
      3: "High",
      2: "Medium",
      1: "Low",
      0: "No Priority",
    };

    switch (grouping) {
      case "status":
        const groupedByStatus = tickets.reduce((acc, ticket) => {
          const key = ticket.status;
          acc[key] = acc[key] || [];
          acc[key].push(ticket);
          return acc;
        }, {});

        const allStatuses = ["Todo", "In progress", "Backlog", "Done", "Cancelled"];
        allStatuses.forEach((status) => {
          if (!groupedByStatus[status]) {
            groupedByStatus[status] = [];
          }
        });
        return groupedByStatus;

      case "user":
        return tickets.reduce((acc, ticket) => {
          const key = users.find((user) => user.id === ticket.userId)?.name || "Unknown";
          acc[key] = acc[key] || [];
          acc[key].push(ticket);
          return acc;
        }, {});

      case "priority":
        return tickets.reduce((acc, ticket) => {
          const key = priorityNames[ticket.priority];
          acc[key] = acc[key] || [];
          acc[key].push(ticket);
          return acc;
        }, {});

      default:
        return tickets;
    }
  };

  const sortedTickets = tickets.sort((a, b) => {
    if (sortOption === "priority") {
      return b.priority - a.priority;
    } else if (sortOption === "title") {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  const groupedTickets = groupTickets(sortedTickets, grouping);

  const handleDisplayClick = () => {
    setDisplayMenuOpen(!displayMenuOpen);
  };

  const handleGroupingChange = (group) => {
    setGrouping(group);
    setDisplayMenuOpen(false);
  };

  const handleSortChange = (sort) => {
    setSortOption(sort);
    setDisplayMenuOpen(false);
  };

  const priorityIcons = {
    Urgent: UrgentPriorityGreyIcon,
    High: HighPriorityIcon,
    Medium: MediumPriorityIcon,
    Low: LowPriorityIcon,
    "No Priority": NoPriorityIcon,
  };

  return (
    <div className="kanban-board">
      <div className="controls">
        <button className="display-container" onClick={handleDisplayClick}>
          <img src={DisplayIcon} alt="Display" className="icon-display" />
          <span className="display-text">Display</span>
          <img src={DownIcon} alt="Dropdown" className="icon-dropdown" />
        </button>

        {displayMenuOpen && (
          <div
            className="filter-menu"
            ref={menuRef}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="filter-row">
              <span className="filter-title">Grouping</span>
              <select
                onChange={(e) => handleGroupingChange(e.target.value)}
                value={grouping}
              >
                <option value="status">Status</option>
                <option value="user">User</option>
                <option value="priority">Priority</option>
              </select>
            </div>

            <div className="filter-row">
              <span className="filter-title">Ordering</span>
              <select
                onChange={(e) => handleSortChange(e.target.value)}
                value={sortOption}
              >
                <option value="priority">Priority</option>
                <option value="title">Title</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="kanban-columns">
        {Object.keys(groupedTickets).map((group) => (
          <div className="kanban-column" key={group}>
            <div className="column-header">
              <div className="status-and-title">
                {grouping !== "user" && (
                  <img
                    src={
                      group === "Todo"
                        ? ToDoIcon
                        : group === "In progress"
                        ? InProgressIcon
                        : group === "Backlog"
                        ? BacklogIcon
                        : group === "Done"
                        ? DoneIcon
                        : group === "Cancelled"
                        ? CancelIcon
                        : priorityIcons[group] || DoneIcon
                    }
                    alt={group}
                    className="group-status-icon"
                  />
                )}
                <div className="title-and-count">
                  <h3 className="group-title">
                    {group}
                    <span className="message-count">
                      {" "}
                      {groupedTickets[group].length}
                    </span>
                  </h3>
                </div>
              </div>
              <div className="icons">
                <img src={AddIcon} alt="Add" className="add-icon" />
                <img src={DotIcon} alt="More options" className="dot-icon" />
              </div>
            </div>

            {groupedTickets[group].map((ticket) => (
              <div className="kanban-card" key={ticket.id}>
                <div className="ticket-id">{ticket.id}</div>
                <div className="status-and-title">
                  <img
                    src={
                      ticket.status === "Todo"
                        ? ToDoIcon
                        : ticket.status === "In progress"
                        ? InProgressIcon
                        : ticket.status === "Backlog"
                        ? BacklogIcon
                        : ticket.status === "Done"
                        ? DoneIcon
                        : ticket.status === "Cancelled"
                        ? CancelIcon
                        : DoneIcon
                    }
                    alt={ticket.status}
                    className="status-icon"
                  />
                  <span className="ticket-title">{ticket.title}</span>
                </div>
                <div className="priority">
                  <img
                    src={
                      ticket.priority === 4
                        ? UrgentPriorityColourIcon
                        : ticket.priority === 3
                        ? HighPriorityIcon
                        : ticket.priority === 2
                        ? MediumPriorityIcon
                        : ticket.priority === 1
                        ? LowPriorityIcon
                        : NoPriorityIcon
                    }
                    alt={ticket.priority}
                    className="priority-icon"
                  />
                  <div>
                    <span className="greendot-icon"></span>
                    <span className="ticket-tag">{ticket.tag}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashBoard;
