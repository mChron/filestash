import React from 'react';
import Path from 'path';
import { Route, Switch, Link, NavLink } from 'react-router-dom';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import './error.scss';
import './adminpage.scss';
import { Icon, LoadingPage } from '../components/';
import { Config, Admin } from '../model';
import { notify } from '../helpers/';
import { HomePage, BackendPage, SettingsPage, LogPage, SetupPage, LoginPage } from './adminpage/';
import { t } from '../locales/';


function AdminOnly(WrappedComponent){
    return class extends React.Component {
        constructor(props){
            super(props);
            this.state = {
                isAdmin: null
            };
            this.admin = () => {
                Admin.isAdmin().then((t) => {
                    this.setState({isAdmin: t});
                }).catch((err) => {
                    notify.send("Error: " + (err && err.message) , "error");
                });
            };
            this.timeout = window.setInterval(this.admin.bind(this), 30 * 1000);
        }

        componentDidMount(){
            this.admin.call(this);
        }

        componentWillUnmount(){
            window.clearInterval(this.timeout);
        }

        render(){
            if(this.state.isAdmin === true){
                return ( <WrappedComponent {...this.props} /> );
            } else if(this.state.isAdmin === false) {
                return ( <LoginPage reload={() => this.admin()} /> );
            }
            return ( <LoadingPage />);
        }
    };
}

@AdminOnly
export class AdminPage extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            isAdmin: null,
            isSaving: false
        };
    }

    isSaving(yesOrNo){
        this.setState({isSaving: yesOrNo});
    }

    render(){
        return (
            <div className="component_page_admin">
              <SideMenu url={this.props.match.url} isLoading={this.state.isSaving}/>
              <div className="page_container scroll-y">
                <ReactCSSTransitionGroup key={window.location.pathname} transitionName="adminpage" transitionLeave={true} transitionEnter={true} transitionLeaveTimeout={15000} transitionEnterTimeout={20000} transitionAppear={true} transitionAppearTimeout={20000}>
                  <Switch>
                    <Route path={this.props.match.url + "/backend"} render={()=><BackendPage isSaving={this.isSaving.bind(this)}/>} />
                    <Route path={this.props.match.url + "/settings"} render={()=><SettingsPage isSaving={this.isSaving.bind(this)}/>} />
                    <Route path={this.props.match.url + "/logs"} render={() =><LogPage isSaving={this.isSaving.bind(this)}/>} />
                    <Route path={this.props.match.url + "/setup"} component={SetupPage} />
                    <Route path={this.props.match.url} component={HomePage} />
                  </Switch>
                </ReactCSSTransitionGroup>
              </div>
            </div>
        );
    }
}

const SideMenu = (props) => {
    return (
        <div className="component_menu_sidebar no-select">
          { props.isLoading ?
            <div className="header">
              <Icon name="arrow_left" style={{"opacity": 0}}/>
              <Icon name="loading" />
            </div> :
            <NavLink to={window.URL_PREFIX + "/"} className="header">
              <Icon name="arrow_left" />
              <img src="assets/logo/android-chrome-512x512.png" />
            </NavLink>
          }
          <h2>{ t("Admin console") }</h2>
          <ul>
            <li>
              <NavLink activeClassName="active" to={props.url + "/backend"}>
                { t("Backend") }
              </NavLink>
            </li>
            <li>
              <NavLink activeClassName="active" to={props.url + "/settings"}>
                { t("Settings") }
              </NavLink>
            </li>
            <li>
              <NavLink activeClassName="active" to={props.url + "/logs"}>
                { t("Logs") }
              </NavLink>
            </li>
          </ul>
        </div>
    );
};
