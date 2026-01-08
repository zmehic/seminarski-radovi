import pandas as pd
df = pd.read_excel("Train-Set-Final2.xlsx")

x = df.drop(columns=["SalesCategory","OutletSales"])
y = df["SalesCategory"]

numericke_kolone = x.select_dtypes(include=["int64","float64"]).columns.tolist()
kategorske_kolone = x.select_dtypes(include=["object","category"]).columns.tolist()

x_kategorije = pd.get_dummies(x[kategorske_kolone])

x_final = pd.concat([x[numericke_kolone], x_kategorije], axis=1)
from sklearn.model_selection import train_test_split
x_train, x_test, y_train, y_test = train_test_split(x_final, y, test_size=0.2, stratify=y, random_state=42)

from sklearn.ensemble import RandomForestClassifier
model = RandomForestClassifier()
"""feat_selector = BorutaPy(model, n_estimators='auto', verbose=0)
feat_selector.fit(x_train, y_train)

print("Feature rankings:")
for col, rank in zip(x.columns, feat_selector.ranking_):
    print(f"{col}: Rank {rank}")

  """
model.fit(x_train, y_train)
importances = model.feature_importances_

# Display feature importances
feature_importances = pd.Series(importances, index=x_train.columns)
print((feature_importances.sort_values(ascending=False)).to_string())

y_pred =  model.predict(x_test)
from sklearn.metrics import classification_report
report = classification_report(y_test, y_pred, output_dict=True)
print(pd.DataFrame(report).transpose().round(2))

