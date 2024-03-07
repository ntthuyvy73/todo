import { useEffect, useRef, useState } from "react";
import { Box, Button, Grid, IconButton, TextField } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import {
  DeleteOutlineOutlined,
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
  PriorityHigh,
  Star,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers";
import "./App.scss";
import dayjs from "dayjs";

const initialValues = {
  id: 0,
  title: "",
  description: "",
  isComplete: false,
  dueDate: dayjs(new Date()),
};

const toDoSchema = yup.object().shape({
  title: yup.string().required("The title is required"),
  dueDate: yup.date().nullable(),
});

function App() {
  const [todos, setTodos] = useState([]); //array todos
  const [itemUpdate, setItemUpdate] = useState(null); //selected item for update
  const [itemPriority, setItemPriority] = useState();
  const titleRef = useRef(); //ref of title

  //set localstorage
  const setLocalStorage = (arr) => {
    //  console.log(arr);
    localStorage.setItem("todolist", JSON.stringify(arr));
  };

  //submit
  const handleSubmit = (values) => {
    //console.log(values);
    if (values.title == "") return;

    const currentID = itemUpdate != null ? itemUpdate.id : 0;
    const selectedItem = itemUpdate;

    const maxID =
      currentID > 0 ? currentID : Math.max(...todos.map((m) => m.id), 0) + 1;
    //create
    let newItem = {
      id: maxID,
      title: values.title,
      description: values.description,
      dueDate: values.dueDate,
    };
    //update: update props
    if (currentID > 0) {
      newItem = {
        ...selectedItem,
        title: values.title,
        description: values.description,
        dueDate: values.dueDate,
      };
    }
    //  console.log(newItem);

    let arrUpdate = [...todos];
    //del item from array if update
    if (currentID > 0) {
      arrUpdate = todos.filter((m) => m.id != currentID); //arr not have id

      handleDelete(currentID);
    }

    arrUpdate = [...arrUpdate, newItem];

    //update
    setTodos(arrUpdate);
    setLocalStorage(arrUpdate);

    //after update: reset form
    if (currentID > 0) {
      handleCancel();
    }
  };

  //btn delete
  const handleDelete = (id) => {
    let data = [...todos];
    data = data.filter((m) => m.id != id);
    //   console.log(data);
    setTodos(data);
    setLocalStorage(data);

    setItemUpdate(null);
  };

  //btn complete
  const handleComplete = (id, isComplete) => {
    const date = new Date();
    let arr = todos.filter((m) => m.id != id); //arr not have id
    const item = todos.filter((m) => m.id == id)[0]; //item of id

    console.log(item);
    handleDelete(id);

    let data = {
      ...item,
      isComplete: isComplete,
      dateComplete: isComplete
        ? date.toLocaleDateString() + " - " + date.toLocaleTimeString()
        : "",
    };

    console.log(data);

    const newArr = [...arr, data];
    setTodos(newArr);
    setLocalStorage(newArr);
  };

  //btn edit
  const handleEdit = (values) => {
    setItemUpdate(values);
    titleRef.current.focus();
  };

  //btn Cancel of update
  const handleCancel = () => {
    setItemUpdate(null);
    titleRef.current.focus();
  };

  //show priority items
  const handlePriority = (values) => {
    console.log("handlePriority");
    if (itemPriority == null || values.id != itemPriority.id)
      setItemPriority(values);
    else setItemPriority(null);
  };

  //set priority
  const handleSetPriorityItem = (priority) => {
    // console.log("handleSetPriorityItem");
    let arr = todos.filter((m) => m.id != itemPriority.id); //arr not have id

    handleDelete(itemPriority.id);

    let data = {
      ...itemPriority,
      priority,
    };
    const newArr = [...arr, data];
    setTodos(newArr);
    setLocalStorage(newArr);

    handlePriority(data);
  };

  const getTimeAgo = (item) => {
    const dt_dueDate = new Date(item.dueDate);
    const dt_now = new Date();
    let isPast = 1; //check status ago or remains
    let timeDifference = dt_now - dt_dueDate;
    if (timeDifference < 0) {
      timeDifference = dt_dueDate - dt_now;
      isPast = 0;
    }
    const seconds = Math.floor(timeDifference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);

    let txt_last = " ago";
    let txt_first = "remains ";
    if (isPast == 0) txt_last = "";
    else txt_first = "";

    if (weeks > 0) {
      return `${txt_first}${weeks} week${weeks > 1 ? "s" : ""}${txt_last}`;
    } else if (days > 0) {
      return `${txt_first}${days} day${days > 1 ? "s" : ""}${txt_last}`;
    } else if (hours > 0) {
      return `${txt_first}${hours} hour${hours > 1 ? "s" : ""}${txt_last}`;
    } else if (minutes > 0) {
      return `${txt_first}${minutes} minute${minutes > 1 ? "s" : ""}${txt_last}`;
    } else {
      return `${txt_first}${seconds} second${seconds > 1 ? "s" : ""}${txt_last}`;
    }
  };

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("todolist"));
    if (data) data.sort((a, b) => a.id - b.id);

    if (data) setTodos(data);
  }, [todos]);

  return (
    <Box className="app">
      <h1>My Todos</h1>

      {/* form */}
      <Formik
        initialValues={itemUpdate || initialValues}
        onSubmit={handleSubmit}
        validationSchema={toDoSchema}
        enableReinitialize="true"
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleSubmit,
          handleBlur,
          setFieldValue,
        }) => (
          <form onSubmit={() => handleSubmit()}>
            <Grid
              container
              spacing={3}
              justifyContent="center"
              alignItems="center"
            >
              <Grid item md={3} xs={12}>
                <TextField
                  inputRef={titleRef}
                  type="text"
                  variant="filled"
                  label="Title"
                  fullWidth
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.title}
                  id="title"
                  name="title"
                  error={!!touched.title && !!errors.title}
                  helperText={errors.title}
                  autoFocus
                />
              </Grid>

              <Grid item md={3} xs={12}>
                <TextField
                  type="text"
                  variant="filled"
                  label="Description"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.description}
                  name="description"
                  fullWidth
                />
              </Grid>

              <Grid item md={3} xs={12}>
                <DatePicker
                  label="Due date"
                  name="dueDate"
                  format="DD/MM/YYYY"
                  value={dayjs(values.dueDate)}
                  onChange={(val) => setFieldValue("dueDate", val)}
                />
              </Grid>

              <Grid
                item
                md={2}
                xs={12}
                style={{
                  md: {
                    display: "flex",
                    alignItems: "center",
                  },
                }}
              >
                <Button
                  variant="contained"
                  type="submit"
                  style={{
                    xs: { with: "100%" },
                  }}
                >
                  {itemUpdate != null ? "Update" : "Add"}
                </Button>

                {/* cancel of update */}
                {itemUpdate && (
                  <Button
                    variant="outlined"
                    type="button"
                    style={{
                      md: { marginTop: "10%" },
                      xs: { with: "100%" },
                      marginLeft: "1rem",
                    }}
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                )}
              </Grid>
            </Grid>
          </form>
        )}
      </Formik>

      {/* end form */}

      {/* list */}
      <Box marginTop={4}>
        <h2>Todo list</h2>

        {todos.map((item, index) => (
          <div
            key={index}
            className={`${item.isComplete ? "active" : ""} 
                        ${item.priority}
                        todo-list-item`}
            style={{ minHeight: "95px" }}
            onClick={() => handleEdit(item)}
          >
            <div style={{ flex: "2" }}>
              <h3>{item.title}</h3>
              <p>{item.description}</p>

              {item.dueDate && (
                <p className="dateComplete">
                  Due date: {getTimeAgo(item)}
                  {/* {item.dueDate.toString()} */}
                </p>
              )}

              {item.isComplete && (
                <p className="dateComplete">Complete on: {item.dateComplete}</p>
              )}
            </div>

            <div style={{ flex: "1" }}>
              <div>
                {/* delete btn */}
                <IconButton
                  title="Delete"
                  className="icon"
                  onClick={(e) => {
                    e.preventDefault();
                    handleDelete(item.id);
                  }}
                >
                  <DeleteOutlineOutlined />
                </IconButton>

                {/* complete/incomplete btn */}
                <IconButton
                  title={item.isComplete ? "Incomplete" : "Complete"}
                  className="icon check-icon"
                  onClick={() => handleComplete(item.id, !item.isComplete)}
                >
                  {item.isComplete && <CloseOutlined />}
                  {!item.isComplete && <CheckOutlined />}
                </IconButton>

                {/* edit btn */}
                <IconButton
                  title="Edit"
                  className="icon"
                  onClick={() => handleEdit(item)}
                >
                  <EditOutlined />
                </IconButton>

                {/* Priority */}
                <IconButton
                  title="Priority"
                  className="icon"
                  onClick={() => handlePriority(item)}
                >
                  <PriorityHigh />
                </IconButton>
              </div>

              {/* detail  priority*/}
              <div className="priority">
                {itemPriority && item.id === itemPriority.id && (
                  <div className="priority-items">
                    <IconButton
                      title="High"
                      className="icon red"
                      onClick={() => handleSetPriorityItem("high")}
                    >
                      <Star />
                    </IconButton>

                    <IconButton
                      title="Average"
                      className="icon green"
                      onClick={() => handleSetPriorityItem("average")}
                    >
                      <Star />
                    </IconButton>

                    <IconButton
                      title="Low"
                      className="icon yellow"
                      onClick={() => handleSetPriorityItem("low")}
                    >
                      <Star />
                    </IconButton>

                    <IconButton
                      title="None"
                      className="icon none "
                      onClick={() => handleSetPriorityItem("")}
                    >
                      <Star />
                    </IconButton>
                  </div>
                )}
              </div>

              {/* end detail  priority*/}
            </div>
          </div>
        ))}
      </Box>
      {/* end list */}
    </Box>
  );
}

export default App;
