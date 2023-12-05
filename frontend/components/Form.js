import React, { useEffect, useState } from 'react'
import axios from 'axios';
import * as yup from "yup"

// 👇 Here are the validation errors you will use with Yup.
const validationErrors = {
  fullNameTooShort: 'full name must be at least 3 characters',
  fullNameTooLong: 'full name must be at most 20 characters',
  sizeIncorrect: 'size must be S or M or L'
}

// 👇 Here you will create your schema.
const formSchema = yup.object().shape({
fullName: yup
.string()
.min(3, validationErrors.fullNameTooShort)
.max(20, validationErrors.fullNameTooLong)
.required('Full name is required'),
size: yup
.string()
.oneOf(['s', 'm', 'l'], validationErrors.sizeIncorrect)
.required('Size is required'),

});


// 👇 This array could help you construct your checkboxes using .map in the JSX.
const toppings = [
  { topping_id: '1', text: 'Pepperoni' },
  { topping_id: '2', text: 'Green Peppers' },
  { topping_id: '3', text: 'Pineapple' },
  { topping_id: '4', text: 'Mushrooms' },
  { topping_id: '5', text: 'Ham' },
]

const getInitialValues = () => ({fullName: '', size: ''})
const getInitialValidation = () => ({fullName: '', size: ''})

export default function Form() {
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [values, setValues] = useState(getInitialValues())
  const [errors, setErrors] = useState(getInitialValidation())
  const [success, setSuccess] = useState()
  const [failure, setFailure] = useState()
  const [submitAllowed, setSubmitAllowed] = useState(false);

  useEffect(() => {
    formSchema.isValid(values).then(setSubmitAllowed)
  }, [values])

  const onChange = evt => {
    let { type, name, value, checked } = evt.target
    value = (type == 'checkbox' ? checked : value)
    setValues({ ...values, [name]: value })
    yup.reach(formSchema, name).validate(value)
      .then(() => setErrors(e => ({ ...e, [name]: '' })))
      .catch(err => setErrors(e => ({ ...e, [name]: err.errors[0] })))
  }

  const handleCheckboxChange = (topping_id) => {
    setSelectedToppings((prevSelectedToppings) => {
      if (prevSelectedToppings.includes(topping_id)) {
        return prevSelectedToppings.filter((topping) => topping !== topping_id);
      } else {
        return [...prevSelectedToppings, topping_id];
      }
    });
  };

  const onSubmit = evt => {
    evt.preventDefault()
    setSubmitAllowed(false)
    axios.post('http://localhost:9009/api/register', values)
      .then(res => {
        console.log(res.data)
        setValues(getInitialValues())
        setSuccess(res.data.message)
        setFailure()
      })
      .catch(err => {
        console.log(err.message)
        console.log(err?.response?.data?.message)
        setFailure(err?.response?.data?.message)
        setSuccess()
      })
      .finally(() => {
        setSubmitAllowed(true)
      })
  };

  return (
    <form onSubmit={onSubmit}>
      <h2>Order Your Pizza</h2>
      {true && <div className='success'>Thank you for your order!</div>}
      {true && <div className='failure'>Something went wrong</div>}
      <div className="input-group">
        <div>
          <label htmlFor="fullName">Full Name</label><br />
          <input
            placeholder="Type full name"
            id="fullName"
            type="text"
            value={getInitialValues.fullName}
            onChange={onChange}
            name="fullName"
          />
        </div>
        {/* Display error message if validation error for full name */}
        {submitAllowed === 'failure' && getInitialValues.fullName === '' && (
          <div className='error'>{validationErrors.fullNameTooShort}</div>
        )}
      </div>

      <div className="input-group">
        <div>
          <label htmlFor="size">Size</label><br />
          <select
            id="size"
            value={getInitialValues.size}
            onChange={onChange}
            name="size"
          >
            <option value="">----Choose Size----</option>
            <option value="s">small</option>
            <option value="m">medium</option>
            <option value="l">large</option>
          </select>
        </div>
        {/* Display error message if validation error for size */}
        {validationErrors.sizeIncorrect && <div className="failure">{validationErrors.sizeIncorrect}</div>}
      </div>

      <div className="input-group">
        {toppings.map((topping) => (
          <label key={topping.topping_id}>
            <input
              name={topping.text}
              type="checkbox"
              checked={selectedToppings.includes(topping.topping_id)}
              onChange={() => handleCheckboxChange(topping.topping_id)}
            />
            {topping.text}
            <br />
          </label>
        ))}
        {/* Display error message if validation error for toppings */}
        {submitAllowed === 'failure' && selectedToppings.length === 0 && (
          <div className='error'>{validationErrors.termsIncorrect}</div>
        )}
      </div>

      {/* Disable the submit button until the form validates */}
      <input type="submit" disabled={!getInitialValues.accept || selectedToppings.length === 0} />
    </form>
  );
}
