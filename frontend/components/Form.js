import React, { useEffect, useState } from 'react'
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
accept: yup.boolean().oneOf([true], validationErrors.termsIncorrect),
});


// 👇 This array could help you construct your checkboxes using .map in the JSX.
const toppings = [
  { topping_id: '1', text: 'Pepperoni' },
  { topping_id: '2', text: 'Green Peppers' },
  { topping_id: '3', text: 'Pineapple' },
  { topping_id: '4', text: 'Mushrooms' },
  { topping_id: '5', text: 'Ham' },
]

export default function Form() {
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [formValues, setFormValues] = useState({
    fullName: '',
    size: '',
    accept: false,
  });
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const inputValue = type === 'checkbox' ? checked : value;

    setFormValues({
      ...formValues,
      [name]: inputValue,
    });
  };

  const handleCheckboxChange = (topping_id) => {
    setSelectedToppings((prevSelectedToppings) => {
      if (prevSelectedToppings.includes(topping_id)) {
        return prevSelectedToppings.filter((topping) => topping !== topping_id);
      } else {
        return [...prevSelectedToppings, topping_id];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Validate form using Yup schema
      await formSchema.validate(formValues, { abortEarly: false });
      // If validation passes, handle the submission logic here
      console.log('Form submitted!');
      setSubmitStatus('success');
    } catch (error) {
      // Handle validation errors
      const errors = {};
      error.inner.forEach((e) => {
        errors[e.path] = e.message;
      });
      console.log('Validation errors:', errors);
      setSubmitStatus('failure');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Order Your Pizza</h2>
      {submitStatus === 'success' && <div className='success'>Thank you for your order!</div>}
      {submitStatus === 'failure' && <div className='failure'>Something went wrong</div>}

      <div className="input-group">
        <div>
          <label htmlFor="fullName">Full Name</label><br />
          <input
            placeholder="Type full name"
            id="fullName"
            type="text"
            value={formValues.fullName}
            onChange={handleChange}
            name="fullName"
          />
        </div>
        {/* Display error message if validation error for full name */}
        {submitStatus === 'failure' && formValues.fullName === '' && (
          <div className='error'>{validationErrors.fullNameTooShort}</div>
        )}
      </div>

      <div className="input-group">
        <div>
          <label htmlFor="size">Size</label><br />
          <select
            id="size"
            value={formValues.size}
            onChange={handleChange}
            name="size"
          >
            <option value="">----Choose Size----</option>
            <option value="s">small</option>
            <option value="m">medium</option>
            <option value="l">large</option>
          </select>
        </div>
        {/* Display error message if validation error for size */}
        {submitStatus === 'failure' && formValues.size === '' && (
          <div className='error'>{validationErrors.sizeIncorrect}</div>
        )}
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
        {submitStatus === 'failure' && selectedToppings.length === 0 && (
          <div className='error'>{validationErrors.termsIncorrect}</div>
        )}
      </div>

      {/* Disable the submit button until the form validates */}
      <input type="submit" disabled={!formValues.accept || selectedToppings.length === 0} />
    </form>
  );
}
