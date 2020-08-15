from flask import Flask, render_template, request,  jsonify,  make_response
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow


app = Flask(__name__)

# настройка и подключение к базе данных
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:alexkardo@127.0.0.1:5439/testing'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
ma = Marshmallow(app)

# воссоздаем структуру базы данных
class Region(db.Model):
    __tablename__ = "t_region"
    id_region = db.Column(db.Integer, primary_key=True)
    region = db.Column(db.String, nullable=False)


class District(db.Model):
    __tablename__ = "t_district"
    id_district = db.Column(db.Integer, primary_key=True)
    district = db.Column(db.String, nullable=False)
    id_region = db.Column(db.Integer, db.ForeignKey('Region.id_region'), nullable=False)


class City(db.Model):
    __tablename__ = "t_city"
    id_city = db.Column(db.Integer, primary_key=True)
    city = db.Column(db.String, nullable=False)
    id_district = db.Column(db.Integer, db.ForeignKey('District.id_district'))


class Dir_street(db.Model):
    __tablename__ = "t_dir_street"
    id_dir_street = db.Column(db.Integer, primary_key=True)
    street = db.Column(db.String, nullable=False)


class Street(db.Model):
    __tablename__ = "t_street"
    id_street = db.Column(db.Integer, primary_key=True)
    id_city = db.Column(db.Integer, db.ForeignKey('City.id_city'))
    id_dir_street = db.Column(db.Integer, db.ForeignKey('t_dir_street.id_dir_street'))
    dir_street_ = db.relationship('Dir_street', backref='streets', lazy="subquery")


class Full_adress(db.Model):
    __tablename__ = "t_full_adress"
    id_full_adress = db.Column(db.Integer, primary_key=True)
    id_street = db.Column(db.Integer, db.ForeignKey('Street.id_street'))
    haus = db.Column(db.Integer, nullable=False)


# темы для создания json ответа на страницу
class DistrictSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = District
        include_fk = True


class CitySchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = City
        include_fk = True


district_schema = DistrictSchema(many=True)
city_schema = CitySchema(many=True)

# главная страница
@app.route("/")
@app.route("/index")
def index():
    region = db.session.query(Region).order_by(Region.id_region).all()  # запрос на вывод списка регионов
    return render_template('index.html', items=region) # запрос на вывод списка регионов


@app.route("/index/res_district", methods=["POST"])  # получаем данные со страницы и передаем обратно результат запроса РАЙОНЫ
def create_entry():
    reg_id = int(((request.get_json())['id'])[10:])  # получаем id, считываем с 11го символа
    my_query = db.session.query(District.id_district, District.district).filter_by(id_region=reg_id).order_by(District.district.desc()).all()  # запрос на вывод списка районов
    out = district_schema.dump(my_query)  # создаем структуру объекта для передачи на страницу
    res = make_response(jsonify(out), 200)  # создаем объект для передачи на страницу
    return res


@app.route("/index/res_city", methods=["POST"])  # получаем данные со страницы и передаем обратно результат запроса ГОРОДА
def create_entry2():
    reg_id = int(((request.get_json())['id'])[11:])
    my_query = db.session.query(City.id_city, City.city).filter_by(id_district=reg_id).order_by(City.city.desc()).all()  # запрос на вывод списка городов
    out = city_schema.dump(my_query)
    res = make_response(jsonify(out), 200)
    return res


@app.route("/index/res_street", methods=["POST"])  # получаем данные со страницы и передаем обратно результат запроса УЛИЦЫ
def create_entry3():
    reg_id = int(((request.get_json())['id'])[7:])
    my_query = db.session.query(Dir_street.street, Street.id_street).join(Street, Dir_street.id_dir_street == Street.id_dir_street).filter_by(id_city=reg_id).all()  # запрос на вывод списка улиц
    res = make_response(jsonify(my_query), 200)
    return res


@app.route("/index/res_haus", methods=["POST"])  # получаем данные со страницы и передаем обратно результат запроса ДОМА
def create_entry4():
    reg_id = int(((request.get_json())['id']))
    my_query = db.session.query(Full_adress.haus).filter_by(id_street=reg_id).all()  # запрос на вывод списка домов
    res = make_response(jsonify(my_query), 200)
    return res


if __name__ == "__main__":
    app.run(debug=True, use_reloader=False)
