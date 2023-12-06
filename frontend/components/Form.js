import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as yup from 'yup';


const validationErrors = {
  fullNameTooShort: 'full name must be at least 3 characters',
  fullNameTooLong: 'full name cannot exceed 20 characters',
  sizeIncorrect: 'size must be S or M or L',
  termsIncorrect: 'at least one topping must be selected',
  
};

const formSchema = yup.object().shape({
  fullName: yup.string().trim().min(3, validationErrors.fullNameTooShort).max(20, validationErrors.fullNameTooLong).required('Full name is required'),
  size: yup.string().oneOf(['S', 'M', 'L'], validationErrors.sizeIncorrect).required('Size is required'),
});

const toppings = [
  { topping_id: '1', text: 'Pepperoni' },
  { topping_id: '2', text: 'Green Peppers' },
  { topping_id: '3', text: 'Pineapple' },
  { topping_id: '4', text: 'Mushrooms' },
  { topping_id: '5', text: 'Ham' },
];

const getInitialValues = () => ({ fullName: '', size: '', accept: false });
const getInitialValidation = () => ({ fullName: '', size: '', terms: '' }); // Added 'terms' to initial validation state

export default function Form() {
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [values, setValues] = useState(getInitialValues());
  const [errors, setErrors] = useState(getInitialValidation());
  const [success, setSuccess] = useState();
  const [failure, setFailure] = useState();
  const [submitAllowed, setSubmitAllowed] = useState(false);

  useEffect(() => {
    formSchema.isValid(values).then((valid) => setSubmitAllowed(valid));
  }, [values]);

  const onChange = (evt) => {
    const { type, name, value, checked } = evt.target;
    const newValue = type === 'checkbox' ? checked : value;
    setValues((prevValues) => ({ ...prevValues, [name]: newValue }));

    (async () => {
      try {
        await yup.reach(formSchema, name).validate(newValue);
        setErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
      } catch (err) {
        setErrors((prevErrors) => ({ ...prevErrors, [name]: err.message }));
      }
    })();
  };

  const handleCheckboxChange = (topping_id) => {
    setSelectedToppings((prevSelectedToppings) =>
      prevSelectedToppings.includes(topping_id)
        ? prevSelectedToppings.filter((topping) => topping !== topping_id)
        : [...prevSelectedToppings, topping_id]
    );
  };

  const onSubmit = async (evt) => {
    evt.preventDefault();
    setSubmitAllowed(false);

    try {
      const response = await axios.post('http://localhost:9009/api/order', {
        fullName: values.fullName,
        size: values.size.toUpperCase(),
        toppings: selectedToppings,
      });

      console.log(response.data);
      setValues(getInitialValues());
      setSuccess(response.data.message);
      setSelectedToppings([]);
      setFailure('');
    } catch (err) {
      console.error(err.message);
      console.error(err?.response?.data?.message);
      setFailure(err?.response?.data?.message || 'Something went wrong');
      setSuccess('');
    } finally {
      setSubmitAllowed(true);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <h2>Order Your Pizza</h2>
      {success && <div className="success">{success}</div>}
      {failure && <div className="failure">{failure}</div>}
      <div className="input-group">
        <div>
          <label htmlFor="fullName">Full Name</label>
          <br />
          <input placeholder="Type full name" id="fullName" type="text" value={values.fullName} onChange={onChange} name="fullName" />
        </div>
        {errors.fullName && <div className="error">{errors.fullName}</div>}
      </div>

      <div className="input-group">
        <div>
          <label htmlFor="size">Size</label>
          <br />
          <select id="size" value={values.size} onChange={onChange} name="size">
            <option value="">----Choose Size----</option>
            <option value="S">small</option>
            <option value="M">medium</option>
            <option value="L">large</option>
          </select>
        </div>
        {errors.size && <div className="error">{errors.size}</div>}
      </div>

      <div className="input-group">
        {toppings.map((topping) => (
          <label key={topping.topping_id}>
            <input name={topping.text} type="checkbox" checked={selectedToppings.includes(topping.topping_id)} onChange={() => handleCheckboxChange(topping.topping_id)} />
            {topping.text}
            <br />
          </label>
        ))}
        {errors.terms && <div className="error">{errors.terms}</div>}
      </div>

      <input type="submit" disabled={!submitAllowed && selectedToppings.length === 0} />
    </form>
  );
}