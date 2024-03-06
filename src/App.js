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
import "./App.scss";

const initialValues = {
    id: 0,
    title: "",
    description: "",
    isComplete: false,
};

const toDoSchema = yup.object().shape({
    title: yup.string().required("The title is required"),
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
        //  if (values.title == "") return;

        const currentID = itemUpdate != null ? itemUpdate.id : 0;
        const selectedItem = itemUpdate;

        const maxID =
            currentID > 0
                ? currentID
                : Math.max(...todos.map((m) => m.id), 0) + 1;
        //create
        let newItem = {
            id: maxID,
            title: values.title,
            description: values.description,
        };
        //update: update props
        if (currentID > 0) {
            newItem = {
                ...selectedItem,
                title: values.title,
                description: values.description,
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

        handleDelete(id);

        let data = {
            ...item,
            isComplete: isComplete,
            dateComplete: isComplete
                ? date.toLocaleDateString() + " - " + date.toLocaleTimeString()
                : "",
        };
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
                }) => (
                    <form onSubmit={() => handleSubmit()}>
                        <Grid container spacing={5} justifyContent="center">
                            <Grid item md={5} xs={12}>
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

                            <Grid item md={5} xs={12}>
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

                            {item.isComplete && (
                                <p className="dateComplete">
                                    Complete on: {item.dateComplete}
                                </p>
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
                                    title={
                                        item.isComplete
                                            ? "Incomplete"
                                            : "Complete"
                                    }
                                    className="icon check-icon"
                                    onClick={() =>
                                        handleComplete(
                                            item.id,
                                            !item.isComplete
                                        )
                                    }
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
                                {itemPriority &&
                                    item.id === itemPriority.id && (
                                        <div className="priority-items">
                                            <IconButton
                                                title="High"
                                                className="icon red"
                                                onClick={() =>
                                                    handleSetPriorityItem(
                                                        "high"
                                                    )
                                                }
                                            >
                                                <Star />
                                            </IconButton>

                                            <IconButton
                                                title="Average"
                                                className="icon green"
                                                onClick={() =>
                                                    handleSetPriorityItem(
                                                        "average"
                                                    )
                                                }
                                            >
                                                <Star />
                                            </IconButton>

                                            <IconButton
                                                title="Low"
                                                className="icon yellow"
                                                onClick={() =>
                                                    handleSetPriorityItem("low")
                                                }
                                            >
                                                <Star />
                                            </IconButton>

                                            <IconButton
                                                title="None"
                                                className="icon none "
                                                onClick={() =>
                                                    handleSetPriorityItem("")
                                                }
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
