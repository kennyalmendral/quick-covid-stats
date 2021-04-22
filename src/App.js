import React, { Fragment, useState, useEffect } from 'react';

import Granim from 'granim';

import { FaGithub, FaSkull, FaFolderOpen, FaBriefcaseMedical } from 'react-icons/fa';
import { ImSpinner2 } from 'react-icons/im';

import { formatRelative, subDays } from 'date-fns';
import axios from 'axios';

import {
	MuiThemeProvider,
	createMuiTheme,
	FormControl,
	FormHelperText,
	InputLabel,
	Select,
	MenuItem,
	Button,
	Paper,
	makeStyles
} from '@material-ui/core';

import { Alert } from '@material-ui/lab';

import CoronaVirus from './assets/coronavirus.svg';

import 'animate.css';
import './App.css';

const theme = createMuiTheme({
	palette: {
	  primary: {
			main: '#689F38'
	  },
	  secondary: {
	    main: '#9C27B0'
	  },
	},
	typography: {
  	useNextVariants: true
	}
});

const useStyles = makeStyles((theme) => ({
	paper: {
		padding: theme.spacing(4)
	}
}));

function App() {
	const classes = useStyles();

	const [countries, setCountries] = useState([]);
	const [country, setCountry] = useState('');
	const [countryData, setCountryData] = useState({});
	const [selectIsInvalid, setSelectIsInvalid] = useState(false);
	const [showSpinner, setShowSpinner] = useState(false);

	useEffect(() => {
		getCountries();

		new Granim({
			element: '#granim-canvas',
			name: 'granim',
			opacity: [1, 1],
			states: {
				'default-state': {
					gradients: [
						['#9C27B0', '#6A1B9A'],
						['#689F38', '#558B2F']
					]
				}
			}
		});
    // eslint-disable-next-line
  }, []);

	const getCountries = async () => {
		try {
			const response = await axios.get('https://disease.sh/v3/covid-19/countries?strict=true');

			const mapResponse = response.data.map((element, index) => {
				return {
					id: index,
					label: element.country,
					value: element.countryInfo.iso2,
					flag: element.countryInfo.flag
				}
			});

			setCountries(mapResponse);
		} catch (e) {
			alert(e);
		}
	}

	const changeCountry = (e) => {
		let me = e.target.value;

		if (me !== '') {
			setSelectIsInvalid(false);
			setCountry(me);
		} else {
			setSelectIsInvalid(true);
		}
	}

	const fetchData = async () => {
		setShowSpinner(true);

		if (country !== '') {
			try {
				const data = await axios.get(`https://disease.sh/v3/covid-19/countries/${country.toLowerCase()}?strict=true`);

				setCountryData(data.data);
				setSelectIsInvalid(false);
			} catch (e) {
				alert(e);
			}
		} else {
			setSelectIsInvalid(true);
		}

		setShowSpinner(false);
	}

	const goBack = () => {
		setCountry('');
		setCountryData({});
	}

	const formatNumber = (number) => {
		return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}

  return (
		<MuiThemeProvider theme={theme}>
	    <div id="app">
				<canvas id="granim-canvas" />

				<Paper id="app-wrapper" className={`${classes.paper} animate__animated animate__fadeIn`}>
		      <header id="header">
						<img className="animate__animated animate__pulse animate__infinite" id="corona-virus" src={CoronaVirus} alt="Corona Virus" />
			  		<h1 className="mt-0">QUICK<strong>COVID</strong>STATS</h1>
		      </header>

					<div>
						{Object.keys(countryData).length === 0 && (
							<Fragment>
								<Alert severity="info" className="mb-2">COVID-19 data sourced from <a href="https://www.worldometers.info/coronavirus/about" target="_blank" rel="noreferrer">Worldometer</a>.</Alert>

								<FormControl className="mt-0" fullWidth margin="normal" variant="outlined" color="primary">
									<InputLabel id="country-label">Country</InputLabel>

									<Select labelId="country-label" id="country" value={country} onChange={changeCountry} label="Country" error={selectIsInvalid}>
										{countries.map(country =>
											<MenuItem value={country.value} key={country.id}>
												<img src={country.flag} className="flag" alt={country.label} />
												<span>{country.label}</span>
											</MenuItem>
										)}
									</Select>

									{selectIsInvalid && <FormHelperText variant="standard" error={selectIsInvalid}>Please select a country</FormHelperText>}
								</FormControl>

								<FormControl fullWidth margin="normal">
									<Button variant="contained" color="primary" size="large" onClick={fetchData} disabled={showSpinner ? true : false}><ImSpinner2 className={!showSpinner ? 'icon-spin icon-font-size mr-1 hide': 'icon-spin icon-font-size mr-1'} /> {showSpinner ? 'Fetching data' : 'Fetch data'}</Button>
								</FormControl>
							</Fragment>
						)}

						{Object.keys(countryData).length > 0 && (
							<Fragment>
								<div id="country" className="d-flex-center">
									<h3 className="country-name mt-0 mb-compact"><img src={countryData.countryInfo.flag} className="flag2x" alt={countryData.country} /><span>{countryData.country}</span></h3>

									<div className="date text-muted">Updated {formatRelative(subDays(new Date(countryData.updated), 3), new Date(), { addSuffix: true })}</div>

									<div className="stats d-flex">
										<div className="cases">
											<h3>Total cases</h3>

											<div>
												<FaFolderOpen />
												<span>{formatNumber(countryData.cases)}</span>
											</div>
										</div>

										<div className="deaths">
											<h3>Total deaths</h3>

											<div>
												<FaSkull />
												<span>{formatNumber(countryData.deaths)}</span>
											</div>
										</div>

										<div className="recoveries">
											<h3>Total recoveries</h3>

											<div>
												<FaBriefcaseMedical />
												<span>{formatNumber(countryData.recovered)}</span>
											</div>
										</div>
									</div>
								</div>

								<FormControl fullWidth margin="normal">
									<Button variant="contained" color="secondary" size="large" onClick={goBack}>Try another country</Button>
								</FormControl>
							</Fragment>
						)}
					</div>

					<footer id="app-footer">
						<p><FaGithub /> <strong>Version 1.0.0</strong> by <a href="https://github.com/kennyalmendral" target="_blank" rel="noreferrer">Kenny Almendral</a></p>
					</footer>
				</Paper>
	    </div>
		</MuiThemeProvider>
  );
}

export default App;
