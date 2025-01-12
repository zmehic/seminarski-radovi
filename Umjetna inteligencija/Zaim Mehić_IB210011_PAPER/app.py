import os
import pandas as pd
from statsmodels.tsa.statespace.sarimax import SARIMAX
from flask import Flask, request, jsonify
from flask_cors import CORS

#Flask i CORS setup
app = Flask(__name__)
CORS(app)

#Putanja do podataka
csv_file_path = 'hitnalast.csv'

#Treniranje modela 
def train_model():
  global data
  data = data_upload()
  train_size = int(len(data) * 1) 
  train = data[:train_size]
  order = (2,1,2)
  seasonal_order = (1,0,2,7)
  train.index = pd.DatetimeIndex(train.index.values, freq="D")
  exog_vars_train = train[['covid', 'tavg', 'tmin', 'tmax','tdiff','minwind', 'maxwind', 'windavg', 'winddiff',
                            'pres', 'sindir', 'cosdir' , 'seasonsin', 'seasoncos', 'sinweek', 'cosweek' ,'holiday']] 
  return SARIMAX(train['value'], order=order, seasonal_order=seasonal_order, exog=exog_vars_train, enforce_stationarity=False, enforce_invertibility=False) 

#Učitavanje podataka iz .csv file-a
def data_upload():
  date_format = lambda x: pd.to_datetime(x, format="%Y-%m-%d")
  data = pd.read_csv(csv_file_path, parse_dates=['date'], index_col='date', date_format=date_format)
  data = data.sort_index()
  return data

#Poziv funkcije za učitavanje podataka
data = data_upload()

#Treniranje modela
sarimax_model = train_model()
results = sarimax_model.fit(maxiter=150)

#api za kreiranje predviđanja
@app.route('/predict', methods=['POST'])
def predict():
    try:
        json_data = request.get_json()
        new_data_df = pd.DataFrame(json_data)

        required_columns = ['covid', 'tavg', 'tmin', 'tmax', 'tdiff', 'minwind',
                            'maxwind', 'windavg', 'winddiff', 'pres', 'sindir',
                            'cosdir', 'seasonsin', 'seasoncos', 'sinweek', 'cosweek', 'holiday']
        if not all(col in new_data_df.columns for col in required_columns):
            raise ValueError(f"Missing required columns. Expected: {required_columns}")
        
        prediction_input = new_data_df[required_columns]
        forecast_sarimax = results.get_forecast(steps=len(new_data_df), exog=prediction_input)
        sarimax_prediction = forecast_sarimax.predicted_mean.tolist() 

        document_input = new_data_df[required_columns]
        document_input['value'] = 0
        document_input['date'] = new_data_df['date']
        document_input['pred'] = sarimax_prediction
        document_input = document_input[['date', 'value'] + required_columns + ['pred']]

        print(document_input)
        if os.path.exists(csv_file_path):
          document_input.to_csv(csv_file_path, mode='a', header=False, index=False)
        return jsonify({"predictions": sarimax_prediction})

    except Exception as e:
        app.logger.error(f"Error during prediction: {e}")
        return jsonify({"error": str(e)}), 500
    

@app.route('/real', methods=['POST'])
def insert_real_data():
  try:
    json_data = request.get_json()
    new_data_df = pd.DataFrame(json_data)

    required_columns = ['date', 'value']
    if not all(col in new_data_df.columns for col in required_columns):
        raise ValueError(f"Missing required columns. Expected: {required_columns}")
    
    df = pd.read_csv(csv_file_path)

    for x in json_data: 
      df.loc[df['date']==x['date'], 'value'] = x['value']

    df.to_csv(csv_file_path, index=False)
    global sarimax_model
    sarimax_model = train_model()
    global results
    results = sarimax_model.fit(maxiter=150)
    return jsonify({"response" : str("Ok")}),200
  except Exception as e:
    app.logger.error(f"Error during prediction: {e}")
    return jsonify({"error": str(e)}), 500


@app.route('/check_missing_values', methods=['GET'])
def check_missing_values():
    try:
        data = pd.read_csv(csv_file_path, parse_dates=['date'])
        missing_value_records = data[data['value']==0].sort_values(by='date')

        if not missing_value_records.empty:
            missing_records_list = missing_value_records.to_dict(orient='records')
            for x in missing_records_list:
              x['date'] = x['date'].strftime('%Y-%m-%d')
            return jsonify({"missing_records": missing_records_list})
            
        last_dates = []
        for i in range(7):
            last_dates.append((pd.to_datetime(data['date'].max(), format="%Y-%m-%d")+ pd.Timedelta(days=i+1)).strftime('%Y-%m-%d') )
        return jsonify({"missing_records": {} ,"message": "No missing values found", "last_dates": last_dates})

    except Exception as e:
        app.logger.error(f"Error in check_missing_values endpoint: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
