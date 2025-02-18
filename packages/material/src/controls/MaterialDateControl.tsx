/*
  The MIT License
  
  Copyright (c) 2017-2019 EclipseSource Munich
  https://github.com/eclipsesource/jsonforms
  
  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:
  
  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.
  
  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.
*/
import startsWith from 'lodash/startsWith';
import React from 'react';
import {
    computeLabel,
    ControlState,
    DispatchPropsOfControl,
    isDateControl,
    isDescriptionHidden,
    isPlainLabel, 
    RankedTester,
    rankWith,
    StatePropsOfControl
} from '@jsonforms/core';
import { Control, withJsonFormsControlProps } from '@jsonforms/react';
import { Hidden } from '@material-ui/core';
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import EventIcon from '@material-ui/icons/Event';
import moment from 'moment';
import { Moment } from 'moment';
import { DatePicker, MuiPickersUtilsProvider } from 'material-ui-pickers';
import MomentUtils from '@date-io/moment';

export interface DateControl {
    momentLocale?: Moment;
}

export class MaterialDateControl extends Control<StatePropsOfDateControl & DispatchPropsOfControl & DateControl, ControlState> {
    render() {
        const {
            description,
            id,
            errors,
            label,
            uischema,
            visible,
            enabled,
            required,
            path,
            handleChange,
            data,
            momentLocale
        } = this.props;
        const defaultLabel = label as string;
        const cancelLabel = '%cancel';
        const clearLabel = '%clear';
        const isValid = errors.length === 0;
        const trim = uischema.options && uischema.options.trim;
        const showDescription = !isDescriptionHidden(visible, description, this.state.isFocused);
        const inputProps = {};
        const localeDateTimeFormat =
            momentLocale ? `${momentLocale.localeData().longDateFormat('L')}`
                : 'YYYY-MM-DD';

        let labelText;
        let labelCancel;
        let labelClear;

        if (isPlainLabel(label)) {
            labelText = label;
            labelCancel = 'Cancel';
            labelClear = 'Clear';
        } else {
            labelText = defaultLabel;
            labelCancel = startsWith(cancelLabel, '%') ? 'Cancel' : cancelLabel;
            labelClear = startsWith(clearLabel, '%') ? 'Clear' : clearLabel;
        }

        const getValue = (event: React.FormEvent<HTMLInputElement>) =>
            (event.target as HTMLInputElement).value;

        return (
            <Hidden xsUp={!visible}>
                <MuiPickersUtilsProvider utils={MomentUtils}>
                    <DatePicker
                        keyboard
                        id={id + '-input'}
                        label={computeLabel(labelText, required)}
                        error={!isValid}
                        fullWidth={!trim}
                        helperText={!isValid ? errors : showDescription ? description : ' '}
                        InputLabelProps={{ shrink: true }}
                        value={data || null}
                        onChange={datetime =>
                            handleChange(path, datetime ? moment(datetime).format('YYYY-MM-DD') : '')
                        }
                        onInputChange={ev =>
                            handleChange(path, getValue(ev) ?
                                moment(getValue(ev)).format('YYYY-MM-DD') : '')}
                        format={localeDateTimeFormat}
                        clearable={true}
                        disabled={!enabled}
                        autoFocus={uischema.options && uischema.options.focus}
                        onClear={() => handleChange(path, '')}
                        onFocus={this.onFocus}
                        onBlur={this.onBlur}
                        cancelLabel={labelCancel}
                        clearLabel={labelClear}
                        leftArrowIcon={<KeyboardArrowLeftIcon />}
                        rightArrowIcon={<KeyboardArrowRightIcon />}
                        keyboardIcon={<EventIcon />}
                        InputProps={inputProps}
                    />
                </MuiPickersUtilsProvider>
            </Hidden>
        );
    }
}

export interface StatePropsOfDateControl extends StatePropsOfControl {
    defaultLabel: string;
    cancelLabel: string;
    clearLabel: string;
}

export const materialDateControlTester: RankedTester = rankWith(4, isDateControl);

export default withJsonFormsControlProps(MaterialDateControl);
