import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {QuestionBase} from '../../../models/dynamic-form-models/question-base';
import {UserSettingsService} from '../../../services/user-settings.service';
import {SelectQuestion} from '../../../models/dynamic-form-models/question-select';
import {InputQuestion} from '../../../models/dynamic-form-models/question-input';
import {FileQuestion} from '../../../models/dynamic-form-models/question-file';
import {TemporaryDataService} from '../../../services/temporary-data.service';
import {UploadFile} from 'ng-zorro-antd';
import * as moment from 'moment';

@Component({
  selector: 'app-dynamic-form-question',
  templateUrl: './dynamic-form-question.component.html',
  styleUrls: ['./dynamic-form-question.component.css']
})
export class DynamicFormQuestionComponent implements OnInit {

  @Input() qBase: QuestionBase<any>;
  @Input() form: FormGroup;
  @Output() qValue = new EventEmitter<any>();
  selectedDateTime: Date;

  options: any[] = [];
  inputPattern = null;
  fileList: UploadFile[] = [];
  fileMultipleSelection: boolean;

  constructor(private uss: UserSettingsService,
              private tds: TemporaryDataService) {}

  ngOnInit() {
    this.prepareAttributes();
    this.form.controls[this.qBase.key].valueChanges.subscribe(value => {
      this.qValue.emit(value);
    });
  }

  prepareAttributes() {
    switch (this.qBase.controlType) {
      case 'select':
        const sq = this.qBase as SelectQuestion;
        if (sq.options.startsWith('__') && sq.options.endsWith('__')) {
          const optionIndex = sq.options.replace(/__/g, '').split('::');
          let optionValues = this.tds.study;
          optionIndex.forEach((oi: string) => {
            optionValues = optionValues[oi];
          });
          if (typeof optionValues === 'string') {
            this.options.push({value: optionValues, name: optionValues});
          } else if (Array.isArray(optionValues)) {
            optionValues.forEach((ai) => {
              if (typeof ai === 'string') {
                this.options.push({value: ai, name: ai});
              } else if (typeof ai === 'object') {
                this.options.push({value: ai, name: ai.name});
              }
            });
          }
        }
        break;
      case 'input':
        const iq = this.qBase as InputQuestion;
        if (iq.pattern) {
          this.inputPattern = `[0-9]{${iq.pattern}}`;
        }
        // if (iq.pattern.startsWith('__') && iq.pattern.endsWith('__')) {
        //   const patternIndex = iq.pattern.replace(/__/g, '').split('::');
        //   let patternValues = this.tds.study;
        //   patternIndex.forEach((oi: string) => {
        //     patternValues = patternValues[oi];
        //   });
        //   this.inputPattern = '[0-9]{' + patternValues + '}';
        // }
        break;
      case 'file':
        const fq = this.qBase as FileQuestion;
        // TODO add file type filter
        this.fileMultipleSelection = fq.multiple;
        break;
      default:
        break;
    }
  }

  handleSelectedFile() {
    console.log(this.fileList);
    const filePaths = this.fileList.map(f => f.path);
    this.form.controls[this.qBase.key].setValue(filePaths);
  }

  beforeConfirmFile = (file: UploadFile): boolean => {
    this.fileList = this.fileList.concat(file);
    return false;
  };

  setTime() {
    const dateString = moment(this.selectedDateTime).format('YYYY-MM-DDTHH:mm');
    this.form.get(this.qBase.key).setValue(dateString);
  }

  setNow() {
    this.selectedDateTime = new Date();
    this.setTime();
  }

}
